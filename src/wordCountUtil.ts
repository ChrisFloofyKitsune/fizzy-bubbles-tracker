const upnBBCodeTags = [
  "b",
  "i",
  "u",
  "color",
  "size",
  "font",
  "highlight",
  "left",
  "right",
  "center",
  "indent",
  "email",
  "url",
  "thread",
  "post",
  "list",
  "img",
  "code",
  "php",
  "html",
  "quote",
  "attach",
  "sigpic",
  "justify",
  "overline",
  "s",
  "spoiler",
  "sub",
  "sup",
  "youtube",
  "noparse",
];

export function removeQuoteBlocks(text: string) {
  return text.replaceAll(/\[quote(=[^\]]*)?].*?\[\/quote]/gis, "").trim();
}

export function removeBBCode(text: string) {
  // 1, nuke everything inside of quote tags
  text = removeQuoteBlocks(text);
  // 2, nuke all bbcode tags save for what's inside "no parse" tags
  const regex = new RegExp(
    `\\[\/?(${upnBBCodeTags.join("|")})(=[^\\]]+)?]`,
    "gis"
  );
  return text
    .replaceAll(regex, (substring, ...args) => {
      const before = (args.at(-1) as string).slice(0, args.at(-2) as number);
      // if there's more noparse begin tags than end tags, assume we're in a noparse block and preserve this bbcode
      if (
        (before.match(/\[noparse]/gi) || []).length >
        (before.match(/\[\/noparse]/gi) || []).length +
          (substring === "[/noparse]" ? 1 : 0)
      ) {
        return substring;
      }
      return "";
    })
    .trim();
}

export function countWordsInBBCode(text: string) {
  return writtenKittenWordCount(removeBBCode(text));
}

/*
Code from writtenkitten.co

LICENSE
Copyright (c) 2011 Alex "Skud" Bayley and Emily Turner, All rights reserved. (Original App)

Copyright (c) 2016 Joshua Walcher, All rights reserved. (Developer of updates and bug fixes since 2016)

Redistribution and use in source and binary forms, with or without modification, are permitted provided that
the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the
following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

export function writtenKittenWordCount(text: string) {
  text = text.replace(/^\s*|\s*$/g, ""); //removes whitespace from front and end
  text = text.replace(/\s+/g, " "); // collapse multiple consecutive spaces
  return text.split(" ").length;
}
