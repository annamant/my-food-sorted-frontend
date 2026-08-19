import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import LandingPageSeo from '../src/components/LandingPageSeo.jsx'

function getDistIndexPath() {
  return path.join(process.cwd(), 'dist', 'index.html')
}

function generateLandingRootHtml() {
  // SSR: we only need the initial content for crawlers/AI extractors.
  // Interactions (scroll, auth submit, etc) are wired up after hydration by the client app.
  return renderToString(React.createElement(LandingPageSeo, {}))
}

function injectLandingIntoDistIndex({ landingMarkup }: { landingMarkup: string }) {
  const distIndexPath = getDistIndexPath()
  const html = fs.readFileSync(distIndexPath, 'utf8')

  // Vite keeps this as an empty root in the static HTML shell.
  const emptyRoot = '<div id="root"></div>'
  if (!html.includes(emptyRoot)) {
    throw new Error(`Expected to find ${emptyRoot} in ${distIndexPath}`)
  }

  const nextHtml = html.replace(emptyRoot, `<div id="root">${landingMarkup}</div>`)
  fs.writeFileSync(distIndexPath, nextHtml, 'utf8')
}

const landingMarkup = generateLandingRootHtml()
injectLandingIntoDistIndex({ landingMarkup })

