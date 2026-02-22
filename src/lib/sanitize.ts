import sanitizeHtml from 'sanitize-html';

export const sanitize = (html: string) => {
    return sanitizeHtml(html, {
        allowedTags: [
            'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4',
            'h5', 'h6', 'hgroup', 'main', 'nav', 'section', 'blockquote', 'dd', 'div',
            'dl', 'dt', 'figcaption', 'figure', 'hr', 'li', 'main', 'ol', 'p', 'pre',
            'ul', 'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn',
            'em', 'i', 'kbd', 'mark', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp',
            'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'caption',
            'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'img'
        ],
        allowedAttributes: {
            a: ['href', 'name', 'target', 'rel', 'class'],
            img: ['src', 'alt', 'width', 'height', 'class'],
            p: ['class'],
            div: ['class'],
            span: ['class'],
            h1: ['class'],
            h2: ['class'],
            h3: ['class'],
            h4: ['class'],
            h5: ['class'],
            h6: ['class'],
        },
        // Protocols allowed for href/src
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
        allowedSchemesByTag: {
            a: ['http', 'https', 'mailto', 'tel'],
            img: ['http', 'https']
        },
        allowedSchemesAppliedToAttributes: ['href', 'src'],
        transformTags: {
            'a': (tagName, attribs) => {
                if (attribs.target === '_blank') {
                    return {
                        tagName: 'a',
                        attribs: {
                            ...attribs,
                            rel: 'noopener noreferrer'
                        }
                    };
                }
                return { tagName, attribs };
            }
        }
    });
};
