/**
 * Blog page behaviour. Everything here is progressive: the pages read and navigate without it.
 * - Highlights the current section in the desktop table of contents.
 * - Wraps wide tables and embeds the CMS did not wrap, and lazy-loads images it did not mark.
 * - "Copy Link" button on posts.
 * - A thin reading-progress line on posts.
 */
import './blog.css'

function initToc() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc-desktop .toc-link'))
  if (!links.length) return
  const targets = links
    .map((link) => ({ link, el: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((t): t is { link: HTMLAnchorElement; el: HTMLElement } => !!t.el)
  let active: HTMLAnchorElement | null = null
  const update = () => {
    const line = 120
    let current = targets[0]
    for (const t of targets) if (t.el.getBoundingClientRect().top <= line) current = t
    if (!current || current.link === active) return
    active?.removeAttribute('aria-current')
    current.link.setAttribute('aria-current', 'location')
    active = current.link
  }
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      update()
      ticking = false
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  update()
}

function hideBrokenImages() {
  // Old posts point at images that no longer exist; hide those instead of showing a broken icon.
  for (const img of document.querySelectorAll<HTMLImageElement>('main img')) {
    img.addEventListener('error', () => {
      img.hidden = true
    })
    if (img.complete && img.naturalWidth === 0 && img.src) img.hidden = true
  }
}

function initContent() {
  const content = document.getElementById('post-content')
  if (!content) return
  for (const table of content.querySelectorAll<HTMLTableElement>('table')) {
    if (table.parentElement?.classList.contains('table-scroll')) continue
    const wrap = document.createElement('div')
    wrap.className = 'table-scroll'
    table.replaceWith(wrap)
    wrap.append(table)
  }
  for (const frame of content.querySelectorAll<HTMLIFrameElement>('iframe')) {
    if (frame.parentElement?.classList.contains('embed')) continue
    const wrap = document.createElement('div')
    wrap.className = 'embed'
    frame.replaceWith(wrap)
    wrap.append(frame)
  }
  for (const img of content.querySelectorAll<HTMLImageElement>('img')) {
    if (!img.loading) img.loading = 'lazy'
    if (!img.getAttribute('decoding')) img.decoding = 'async'
  }
}

function initCopyLink() {
  const button = document.querySelector<HTMLButtonElement>('[data-copy-link]')
  if (!button) return
  const label = button.textContent
  button.addEventListener('click', async () => {
    const url = button.dataset.copyLink || window.location.href
    try {
      await navigator.clipboard.writeText(url)
      button.textContent = 'Copied'
    } catch {
      button.textContent = 'Press Ctrl+C To Copy'
      window.getSelection()?.selectAllChildren(button)
    }
    window.setTimeout(() => {
      button.textContent = label
    }, 2000)
  })
}

function initProgress() {
  const content = document.getElementById('post-content')
  if (!content) return
  const bar = document.createElement('div')
  bar.className = 'reading-progress'
  bar.setAttribute('aria-hidden', 'true')
  document.body.prepend(bar)
  const update = () => {
    const rect = content.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    const read = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1
    bar.style.width = `${read * 100}%`
  }
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

function initTopicNav() {
  const active = document.querySelector<HTMLElement>('.topic-nav [aria-current="page"]')
  active?.scrollIntoView({ block: 'nearest', inline: 'center' })
}

hideBrokenImages()
initContent()
initToc()
initCopyLink()
initProgress()
initTopicNav()
