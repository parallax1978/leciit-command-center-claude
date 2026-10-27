import { Fragment } from 'react'

/** Lets a price wrap before its unit ("$1,622.40" then "/year") instead of breaking inside a word. */
export function breakBeforeUnit(text: string) {
  return text.split('/').map((part, i) =>
    i === 0 ? (
      part
    ) : (
      <Fragment key={i}>
        <wbr />/{part}
      </Fragment>
    ),
  )
}
