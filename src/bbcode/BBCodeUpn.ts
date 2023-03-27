// noinspection HtmlDeprecatedAttribute,CssReplaceWithShorthandSafely,CssRedundantUnit
// noinspection HtmlDeprecatedAttribute

import yabbcode from "ya-bbcode";

class BBCodeUpn extends yabbcode {
  constructor() {
    super({
      paragraph: false,
      cleanUnmatchable: false,
      newline: true,
    });
  }

  parse(bbc: any): string {
    return super.parse(bbc.replaceAll("<", "&lt;").replaceAll(">", "&gt;"));
  }
}

const BBCodeParser = new BBCodeUpn();

//@ts-ignore
BBCodeParser.regex.tags = /(\[[^\r\n\]]+])/g;

//@ts-ignore
BBCodeParser.contentModules.optionalAttribute = (tag, module, content) => {
  if (!tag.closing) return content;
  const openTag = "[TAG-" + tag.index + "]";
  const closeTag = "[TAG-" + tag.closing.index + "]";
  let hadAttr = true;

  // If the tag does not have an attribute, replace it with its inner content for the opening tag
  if (
    (tag.attr === null || typeof tag.attr === "undefined") &&
    !tag.isClosing
  ) {
    const start = content.indexOf(openTag);
    const end = content.indexOf(closeTag);
    tag.attr = content.slice(start + openTag.length, end);
    hadAttr = false;
  }

  let open = module.open;
  let close = module.close;
  if (typeof open === "function") {
    open = open(tag.attr, hadAttr);
  }
  if (typeof close === "function") {
    close = close(tag.attr);
  }
  // do the replacement
  if (open && !tag.isClosing) {
    //content = content
    content = content.replace(openTag, open);
  }
  if (close && tag.closing) {
    content = content.replace(closeTag, close);
  }
  return content;
};

type replaceOption = [
  tag: string,
  options: {
    type: "replace";
    open: ((attr: string) => string) | string;
    close: ((attr: string) => string) | string | null;
  }
];
type contentOption = [
  tag: string,
  options: {
    type: "content";
    replace: (attr: string, content: string) => string;
  }
];
type ignoreOption = [
  tag: string,
  optoins: {
    type: "ignore";
  }
];
type optionalAttributeOption = [
  tag: string,
  options: {
    type: "optionalAttribute";
    open: ((attr: string, hadAttr: boolean) => string) | string;
    close: ((attr: string) => string) | string | null;
  }
];

type tagOption =
  | replaceOption
  | contentOption
  | ignoreOption
  | optionalAttributeOption;

function attrTag(
  bbcTag: string,
  htmlTag: string,
  attribute?: string,
  attrValue?: string
): replaceOption {
  return [
    bbcTag,
    {
      type: "replace",
      open: (attr) =>
        `<${htmlTag} ${attribute || bbcTag}="${
          attr?.replace(`"`, "") || attrValue || bbcTag
        }">`,
      close: `</${htmlTag}>`,
    },
  ];
}

const upnTagOptions: tagOption[] = [
  ["b", { type: "replace", open: "<b>", close: "</b>" }],
  attrTag("color", "font"),
  attrTag("size", "font"),
  attrTag("font", "font", "face"),
  attrTag("highlight", "span", "class"),
  attrTag("left", "div", "align"),
  attrTag("center", "div", "align"),
  attrTag("right", "div", "align"),
  [
    "indent",
    {
      type: "replace",
      open: "<blockquote><div>",
      close: "</div></blockquote>",
    },
  ],
  [
    "email",
    {
      type: "optionalAttribute",
      open: (attr) => `<a href="mailto:${attr}">`,
      close: `</a>`,
    },
  ],
  [
    "url",
    {
      type: "optionalAttribute",
      open: (attr) => {
        attr = attr
          .replaceAll(/"'/g, "")
          .replace("http://forums.upn", "https://forums.upn");
        return `<a href="${attr}" target="_blank">`;
      },
      close: "</a>",
    },
  ],
  [
    "thread",
    {
      type: "optionalAttribute",
      open: (attr, hadAttr) =>
        `<a href="https://forums.upnetwork.net/showthread.php?t=${attr}" target="_blank"${
          !hadAttr ? "" : ` title="UPNetwork - Thread ${attr}"`
        }>${hadAttr ? "" : `https://forums.upnetwork.net/showthread.php?t=`}`,
      close: `</a>`,
    },
  ],
  [
    "post",
    {
      type: "optionalAttribute",
      open: (attr, hadAttr) =>
        `<a href="https://forums.upnetwork.net/showthread.php?p=${attr}#post${attr}" target="_blank"${
          !hadAttr ? "" : ` title="UPNetwork - Post ${attr}"`
        }>${
          hadAttr
            ? ""
            : `https://forums.upnetwork.net/showthread.php?p=${attr}#post`
        }`,
      close: `</a>`,
    },
  ],
  [
    "list",
    {
      type: "replace",
      open: (attr) => (attr ? `<ol type="${attr}">` : `<ul>`),
      close: (attr) => (attr ? `</ol>` : `</ul>`),
    },
  ],
  [
    "img",
    {
      type: "content",
      replace: (attr, content) => {
        if (!content) {
          return "";
        }
        return `<img class="inlineimg" src="${content.replace(
          /^http:\/\/forums.upn/,
          "https://forums.upn"
        )}" alt="${attr || ""}" border="0">`;
      },
    },
  ],
  [
    "code",
    {
      type: "replace",
      open: '<div style="margin:20px; margin-top:5px"><div class="smallfont" style="margin-bottom:2px">Code:</div><pre class="alt2" dir="ltr" style="margin: 0px;padding: 6px;border: 1px inset;width: auto;height: 98px;text-align: left;overflow: auto">',
      close: "</pre></div>",
    },
  ],
  [
    "php",
    {
      type: "replace",
      open: '<div style="margin:20px; margin-top:5px"><div class="smallfont" style="margin-bottom:2px">PHP Code:</div><pre class="alt2" dir="ltr" style="margin: 0px;padding: 6px;border: 1px inset;width: auto;height: 98px;text-align: left;overflow: auto">',
      close: "</pre></div>",
    },
  ],
  [
    "html",
    {
      type: "replace",
      open: '<div style="margin:20px; margin-top:5px"><div class="smallfont" style="margin-bottom:2px">HTML Code:</div><pre class="alt2" dir="ltr" style="margin: 0px;padding: 6px;border: 1px inset;width: auto;height: 98px;text-align: left;overflow: auto">',
      close: "</pre></div>",
    },
  ],
  [
    "quote",
    {
      type: "replace",
      open: (attr) => {
        const [citation, postNumber] = attr ? attr.split(";").slice(0, 2) : [];
        return (
          `<div style="margin:20px; margin-top:5px; "><div class="smallfont" style="margin-bottom:2px">Quote:</div><table cellpadding="6" cellspacing="0" border="0" width="100%"><tbody><tr><td class="alt2" style="border:1px inset">` +
          (citation
            ? `<div>Originally Posted by <strong>${citation}</strong>${
                postNumber
                  ? `<a href="https://forums.upnetwork.net/showthread.php?p=${postNumber}#post${postNumber}" rel="nofollow"><img class="inlineimg" src="https://forums.upnetwork.net/images/styles/blacksmart/buttons/viewpost.gif" border="0" alt="View Post" title="View Post"></a>`
                  : ``
              }</div><div style="font-style:italic">`
            : ``)
        );
      },
      close: (attr) =>
        `${attr ? `</div>` : ``}</td></tr></tbody></table></div>`,
    },
  ],
  attrTag("overline", "span", `style`, `text-decoration: overline;`),
  ["s", { type: "replace", open: "<del>", close: "</del>" }],
  [
    "spoiler",
    {
      type: "replace",
      open:
        `<div style="padding: 3px; border: 1px solid #d8d8d8; font-size: 1em;"><div style="text-transform: uppercase; border-bottom: 1px solid #CCCCCC; margin-bottom: 3px; font-size: 0.8em; font-weight: bold; display: block;">` +
        `<span onClick="` +
        (`if (this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display != '') {` +
          (`this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = '';` +
            `this.innerHTML = '<b>Spoiler: </b><a href=\\'#\\' onClick=\\'return false;\\'>Hide</a>';`) +
          `} else {` +
          `this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = 'none';` +
          `this.innerHTML = '<b>Spoiler: </b><a href=\\'#\\' onClick=\\'return false;\\'>Show</a>';` +
          `}`) +
        `"/><b>Spoiler: </b><a href="#" onClick="return false;">show</a></span></div><div class="quotecontent"><div style="display: none;">`,
      close: `</div></div></div>`,
    },
  ],
  ["sub", { type: "replace", open: "<sub>", close: "</sub>" }],
  ["sup", { type: "replace", open: "<sup>", close: "</sup>" }],
  [
    "youtube",
    {
      type: "content",
      replace(attr, content) {
        if (!content) return "";
        return `<object type="application/x-shockwave-flash" data="https://www.youtube.com/v/${content}" width="644" height="390"><param name="movie" value="https://www.youtube.com/v/${content}" />BORKED</object>`;
      },
    },
  ],
];

upnTagOptions.forEach(([tag, options]) =>
  // @ts-ignore
  BBCodeParser.registerTag.call(BBCodeParser, tag, options)
);

Object.freeze(BBCodeParser);

export default BBCodeParser;
export { BBCodeParser };
