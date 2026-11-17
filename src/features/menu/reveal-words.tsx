import { Fragment } from 'react';

export function RevealWords({ text }: { text: string }) {
  return (
    <span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((word, index) => (
          <Fragment key={index}>
            {index > 0 && ' '}
            <span className="reveal-word">
              {Array.from(word, (letter, letterIndex) => (
                <span className="reveal-letter" key={letterIndex}>{letter}</span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
