/**
 * Blog page behaviour. Everything here is progressive: the pages read and navigate without it.
 * - Marks the section in view in the "On this page" rail (posts, topic pages, archive months).
 * - The sidebar Filter box narrows the topic tree as you type (without JavaScript it is a search form).
 * - Keeps the current topic or post in view inside a long sidebar.
 * - Closes a disclosure after a tap on one of its same-page links.
 * - Wraps wide tables and embeds the CMS did not wrap, and lazy-loads images it did not mark.
 * - "Copy Link" button on posts, and a thin reading-progress line.
 */
import './blog.css'

function initToc() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.rail .toc-link'))
  if (!links.length) return
  const targets = links
    .map((link) => ({ link, el: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((t): t is { link: HTMLAnchorElement; el: HTMLElement } => !!t.el)
  if (!targets.length) return
  let active: HTMLAnchorElement | null = null
  const update = () => {
    const line = 140
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

function initFilter() {
  for (const side of document.querySelectorAll<HTMLElement>('[data-side]')) {
    const input = side.querySelector<HTMLInputElement>('[data-filter-input]')
    const empty = side.querySelector<HTMLElement>('[data-filter-empty]')
    if (!input) continue
    const hubs = Array.from(side.querySelectorAll<HTMLElement>('[data-hub]')).map((hub) => {
      const details = hub.querySelector('details') as HTMLDetailsElement
      return {
        hub,
        details,
        initiallyOpen: details.open,
        name: (details.querySelector('summary')?.textContent ?? '').trim().toLowerCase(),
        topics: Array.from(hub.querySelectorAll<HTMLElement>('[data-topic]')).map((topic) => ({
          topic,
          name: (topic.querySelector('.side-name')?.textContent ?? '').trim().toLowerCase(),
          posts: Array.from(topic.querySelectorAll<HTMLElement>('[data-post]')).map((post) => ({ post, title: (post.textContent ?? '').trim().toLowerCase() })),
        })),
      }
    })
    const apply = () => {
      const q = input.value.trim().toLowerCase()
      let anyMatch = false
      for (const h of hubs) {
        const hubHit = !!q && h.name.includes(q)
        let hubShown = false
        for (const t of h.topics) {
          const topicHit = !q || hubHit || t.name.includes(q)
          let postHit = false
          for (const p of t.posts) {
            const hit = !!q && p.title.includes(q)
            postHit ||= hit
            p.post.hidden = !!q && !topicHit && !hit
          }
          const shown = topicHit || postHit
          t.topic.hidden = !shown
          hubShown ||= shown
        }
        h.hub.hidden = !hubShown
        h.details.open = q ? hubShown : h.initiallyOpen
        anyMatch ||= hubShown
      }
      if (empty) empty.hidden = !q || anyMatch
    }
    input.addEventListener('input', apply)
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && input.value) {
        input.value = ''
        apply()
      }
    })
  }
}

function initSidebarScroll() {
  const side = document.querySelector<HTMLElement>('.sidebar .side')
  if (!side || side.scrollHeight <= side.clientHeight) return
  const current = side.querySelector<HTMLElement>('[data-topic] a[aria-current]')
  if (!current) return
  const top = current.getBoundingClientRect().top - side.getBoundingClientRect().top + side.scrollTop
  if (top + current.offsetHeight > side.clientHeight) side.scrollTop = top - side.clientHeight / 3
}

function initDisclosures() {
  for (const details of document.querySelectorAll<HTMLDetailsElement>('.sbar-menu, .toc-mobile, .browse')) {
    details.addEventListener('click', (event) => {
      const link = (event.target as Element).closest('a')
      if (link && link.hash && link.pathname === window.location.pathname) details.open = false
    })
  }
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
    if (!img.getAttribute('loading')) img.loading = 'lazy'
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

hideBrokenImages()
initContent()
initToc()
initFilter()
initSidebarScroll()
initDisclosures()
initCopyLink()
initProgress()
