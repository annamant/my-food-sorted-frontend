import { useMemo, useState } from 'react'
import './Tailor.css'
import {
  TAILOR_STEPS,
  CUISINE_OPTIONS,
  EQUIPMENT_OPTIONS,
  AGE_OPTIONS,
  SEX_OPTIONS,
  ACTIVITY_OPTIONS,
} from '../data/tailorSteps'

function toList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[,;]+/).map((v) => v.trim()).filter(Boolean)
  return []
}

function fromList(list) {
  return (list || []).join(', ')
}

/**
 * Generalist guided profile builder ("tailor").
 * Walks the user through what they like / avoid / time / equipment /
 * who / skill / budget / light body info, then saves to /me.
 */
function Tailor({ apiBase, accessToken, prefs, onComplete, onClose }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [draft, setDraft] = useState(() => ({
    cuisines: fromList(toList(prefs?.cuisines)),
    avoid: prefs?.allergies || '',
    max_cook_minutes: prefs?.max_cook_minutes ?? null,
    kitchen_equipment: fromList(toList(prefs?.kitchen_equipment)),
    cooks_for: prefs?.cooks_for || null,
    household_size: prefs?.household_size ?? 2,
    cooking_skill: prefs?.cooking_skill || null,
    default_budget: prefs?.default_budget ?? null,
    age_range: prefs?.age_range || null,
    sex: prefs?.sex || null,
    activity_level: prefs?.activity_level || null,
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const step = TAILOR_STEPS[stepIdx]
  const isLast = stepIdx === TAILOR_STEPS.length - 1

  const canAdvance = useMemo(() => {
    if (!step.required) return true
    const v = draft[step.field]
    if (step.type === 'chips' && !step.multi) return v != null && v !== ''
    if (step.type === 'number') return v != null && v !== '' && !Number.isNaN(Number(v))
    return true
  }, [step, draft])

  const toggleChip = (field, value, multi) => {
    setDraft((prev) => {
      if (multi) {
        const list = toList(prev[field])
        const has = list.some((x) => x.toLowerCase() === String(value).toLowerCase())
        return { ...prev, [field]: has ? list.filter((x) => x.toLowerCase() !== String(value).toLowerCase()) : [...list, value] }
      }
      return { ...prev, [field]: value }
    })
  }

  const next = () => {
    if (!canAdvance) return
    if (isLast) {
      finish()
    } else {
      setStepIdx((i) => i + 1)
    }
  }

  const back = () => {
    if (stepIdx === 0) {
      onClose?.()
    } else {
      setStepIdx((i) => i - 1)
    }
  }

  const finish = async () => {
    setSaving(true)
    setError('')
    const patch = {
      cuisines: fromList(draft.cuisines),
      allergies: draft.avoid || null,
      max_cook_minutes: draft.max_cook_minutes != null && draft.max_cook_minutes !== '' ? Number(draft.max_cook_minutes) : null,
      kitchen_equipment: fromList(draft.kitchen_equipment),
      cooks_for: draft.cooks_for || null,
      household_size: Number(draft.household_size) || 1,
      cooking_skill: draft.cooking_skill || null,
      default_budget: draft.default_budget != null && draft.default_budget !== '' ? Number(draft.default_budget) : null,
      age_range: draft.age_range || null,
      sex: draft.sex || null,
      activity_level: draft.activity_level || null,
    }
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let msg = 'Could not save your profile.'
        try { msg = JSON.parse(text)?.error || msg } catch { /* keep default */ }
        throw new Error(msg)
      }
      onComplete?.(patch)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="tailor">
      <div className="tailor__progress">
          <div className="tailor__progressBar" style={{ width: (((stepIdx + 1) / TAILOR_STEPS.length) * 100) + '%' }} />
      </div>

      <div className="tailor__card">
        <h2 className="tailor__title">{step.title}</h2>
        <p className="tailor__sub">{step.sub}</p>

        {step.type === 'chips' && step.multi && (
          <div className="tailor__chips">
            {step.options.map((opt) => {
              const list = toList(draft[step.field])
              const active = list.some((x) => x.toLowerCase() === String(opt).toLowerCase())
              return (
                <button
                  key={opt}
                  type="button"
                  className={`tailor__chip ${active ? 'tailor__chip--active' : ''}`}
                  onClick={() => toggleChip(step.field, opt, true)}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {step.type === 'chips' && !step.multi && (
          <div className="tailor__chips">
            {step.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`tailor__chip ${draft[step.field] === opt.id ? 'tailor__chip--active' : ''}`}
                onClick={() => toggleChip(step.field, opt.id, false)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {step.type === 'text' && (
          <textarea
            className="tailor__text"
            placeholder={step.placeholder}
            value={draft[step.field]}
            onChange={(e) => setDraft((prev) => ({ ...prev, [step.field]: e.target.value }))}
            rows={2}
          />
        )}

        {step.type === 'number' && (
          <div className="tailor__numberRow">
            {step.prefix && <span className="tailor__prefix">{step.prefix}</span>}
            <input
              type="number"
              min={step.min}
              max={step.max}
              className="tailor__number"
              value={draft[step.field] ?? ''}
              onChange={(e) => setDraft((prev) => ({ ...prev, [step.field]: e.target.value === '' ? null : Number(e.target.value) }))}
            />
          </div>
        )}

        {step.type === 'about' && (
          <div className="tailor__about">
            {[
              { label: 'Age range', field: 'age_range', options: AGE_OPTIONS },
              { label: 'Sex', field: 'sex', options: SEX_OPTIONS },
              { label: 'Activity level', field: 'activity_level', options: ACTIVITY_OPTIONS },
            ].map((group) => (
              <label key={group.field} className="tailor__aboutField">
                <span>{group.label}</span>
                <select
                  value={draft[group.field] || ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [group.field]: e.target.value || null }))}
                >
                  <option value="">Not set</option>
                  {group.options.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}

        {error && <p className="tailor__error">{error}</p>}

        <div className="tailor__actions">
          <button type="button" className="btn btn--ghost" onClick={back} disabled={saving}>
            {stepIdx === 0 ? 'Cancel' : 'Back'}
          </button>
          <button type="button" className="btn btn--primary" onClick={next} disabled={!canAdvance || saving}>
            {saving ? 'Saving…' : isLast ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Tailor
