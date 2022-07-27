// noinspection HtmlDeprecatedTag,HtmlDeprecatedAttribute,XmlDeprecatedElement,CssRedundantUnit

import { BBCodeParser } from "./BBCodeUpn";

type BBCodeTestCase = [input: string, expectedOutput: string];

function testCase(input: string, output: string): BBCodeTestCase {
  return [
    input
      .split("\n")
      .map((line) => line.trim())
      .join(""),
    output
      .split("\n")
      .map((line) => line.trim().replace("<br>", ""))
      .join(""),
  ];
}

const TEST_CASES: BBCodeTestCase[] = [
  testCase(
    `[color=red]1[/color]
        [color=blue]2[/color]
        [color=green]3[/color]`,
    `<font color="red">1</font>
        <font color="blue">2</font>
        <font color="green">3</font>`
  ),
  testCase(
    `[b]this text is bold[/b]
        [i]this text is italic[/i]
        [u]this text is underlined[/u]`,
    `<b>this text is bold</b>
        <i>this text is italic</i>
        <u>this text is underlined</u>`
  ),
  testCase(
    "[color=blue]this text is blue[/color]",
    '<font color="blue">this text is blue</font>'
  ),
  testCase(
    "[size=+2]this text is two sizes larger than normal[/size]",
    '<font size="+2">this text is two sizes larger than normal</font>'
  ),
  testCase(
    "[font=courier]this text is in the courier font[/font]",
    '<font face="courier">this text is in the courier font</font>'
  ),
  testCase(
    "[highlight]this text is highlighted[/highlight]",
    '<span class="highlight">this text is highlighted</span>'
  ),
  testCase(
    `[left]this text is left-aligned[/left]
        [center]this text is center-aligned[/center]
        [right]this text is right-aligned[/right]`,
    `<div align="left">this text is left-aligned</div>
        <div align="center">this text is center-aligned</div>
        <div align="right">this text is right-aligned</div>`
  ),
  testCase(
    "[indent]this text is indented[/indent]",
    "<blockquote><div>this text is indented</div></blockquote>"
  ),
  testCase(
    `[email]j.doe@example.com[/email]
        [email=j.doe@example.com]Click Here to Email Me[/email]`,
    `<a href="mailto:j.doe@example.com">j.doe@example.com</a>
        <a href="mailto:j.doe@example.com">Click Here to Email Me</a>`
  ),
  testCase(
    `[url]http://forums.upnetwork.net[/url]
        [url=http://forums.upnetwork.net]UPNetwork[/url]`,
    `<a href="https://forums.upnetwork.net" target="_blank">http://forums.upnetwork.net</a>
        <a href="https://forums.upnetwork.net" target="_blank">UPNetwork</a>`
  ),
  testCase(
    `[thread]42918[/thread]
        [thread=42918]Click Me![/thread]`,
    `<a href="https://forums.upnetwork.net/showthread.php?t=42918" target="_blank">http://forums.upnetwork.net/showthread.php?t=42918</a>
        <a href="https://forums.upnetwork.net/showthread.php?t=42918" target="_blank" title="UPNetwork - Thread 42918">Click Me!</a>`
  ),
  testCase(
    `[post]269302[/post]
        [post=269302]Click Me![/post]`,
    `<a href="https://forums.upnetwork.net/showthread.php?p=269302#post269302" target="_blank">http://forums.upnetwork.net/showthread.php?p=269302#post269302</a>
        <a href="https://forums.upnetwork.net/showthread.php?p=269302#post269302" target="_blank" title="UPNetwork - Post 269302">Click Me!</a>`
  ),
  testCase(
    `[list]
        [*]list item 1
        [*]list item 2
        [/list]`,
    `<ul><li>list item 1<li>list item 2</ul>`
  ),
  testCase(
    `[list=1]
        [*]list item 1
        [*]list item 2
        [/list]
        [list=a]
        [*]list item 1
        [*]list item 2
        [/list]`,
    `<ol type="1"><li>list item 1<li>list item 2</ol>
        <ol type="a"><li>list item 1<li>list item 2</ol>`
  ),
  testCase(
    `[img]http://forums.upnetwork.net/images/styles/blacksmart/statusicon/forum_new.gif[/img] (Not linked)
        [url=http://www.example.com][img]http://forums.upnetwork.net/images/styles/blacksmart/statusicon/forum_new.gif[/img][/url] (Linked)`,
    `<img class="inlineimg" src="https://forums.upnetwork.net/images/styles/blacksmart/statusicon/forum_new.gif" alt="" border="0"> (Not linked)
        <a href="http://www.example.com" target="_blank"><img class="inlineimg" src="https://forums.upnetwork.net/images/styles/blacksmart/statusicon/forum_new.gif" alt="" border="0"></a> (Linked)`
  ),
  testCase(
    `[code]
        <script type="text/javascript">
        <!--
            alert("Hello world!");
        //-->
        </script>
        [/code]`,
    `<div style="margin:20px; margin-top:5px">
        <div class="smallfont" style="margin-bottom:2px">Code:</div>
        <pre class="alt2" dir="ltr" style="
                margin: 0px;
                padding: 6px;
                border: 1px inset;
                width: auto;
                height: 98px;
                text-align: left;
                overflow: auto">&lt;script type="text/javascript"&gt;
        &lt;!--
            alert("Hello world!");
        //--&gt;
        &lt;/script&gt;</pre>
        </div>`
  ),
  testCase(
    `[quote]Lorem ipsum dolor sit amet[/quote]
        [quote=John Doe]Lorem ipsum dolor sit amet[/quote]
        [quote=John Doe;864427]Lorem ipsum dolor sit amet[/quote]`,
    `<div style="margin:20px; margin-top:5px; ">
        <div class="smallfont" style="margin-bottom:2px">Quote:</div>
        <table cellpadding="6" cellspacing="0" border="0" width="100%">
        <tbody><tr>
        <td class="alt2" style="border:1px inset">
        Lorem ipsum dolor sit amet
        </td>
        </tr>
        </tbody></table>
        </div>
        <div style="margin:20px; margin-top:5px; ">
        <div class="smallfont" style="margin-bottom:2px">Quote:</div>
        <table cellpadding="6" cellspacing="0" border="0" width="100%">
        <tbody><tr>
        <td class="alt2" style="border:1px inset">
        <div>
        Originally Posted by <strong>John Doe</strong>
        </div>
        <div style="font-style:italic">Lorem ipsum dolor sit amet</div>
        </td>
        </tr>
        </tbody></table>
        </div>
        <div style="margin:20px; margin-top:5px; ">
        <div class="smallfont" style="margin-bottom:2px">Quote:</div>
        <table cellpadding="6" cellspacing="0" border="0" width="100%">
        <tbody><tr>
        <td class="alt2" style="border:1px inset">
        <div>
        Originally Posted by <strong>John Doe</strong>
        <a href="https://forums.upnetwork.net/showthread.php?p=864427#post864427" rel="nofollow"><img class="inlineimg" src="https://forums.upnetwork.net/images/styles/blacksmart/buttons/viewpost.gif" border="0" alt="View Post" title="View Post"></a>
        </div>
        <div style="font-style:italic">Lorem ipsum dolor sit amet</div>
        </td>
        </tr>
        </tbody></table>
        </div>`
  ),
  testCase(
    `[noparse][b]Lorem ipsum dolor sit amet[/b][/noparse]`,
    `[b]Lorem ipsum dolor sit amet[/b]`
  ),
  testCase(
    `[overline]This text is overlined[/overline]`,
    `<span style="text-decoration: overline;">This text is overlined</span>`
  ),
  testCase(`[s]Strikethrough[/s]`, `<del>Strikethrough</del>`),
  testCase(
    `[spoiler]Snape kills Dumbledore[/spoiler]`,
    `<div style="padding: 3px; border: 1px solid #d8d8d8; font-size: 1em;"><div style="text-transform: uppercase; border-bottom: 1px solid #CCCCCC; margin-bottom: 3px; font-size: 0.8em; font-weight: bold; display: block;"><span onClick="if (this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display != '') {this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = '';this.innerHTML = '<b>Spoiler: </b><a href=\\'#\\' onClick=\\'return false;\\'>Hide</a>';} else {this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = 'none';this.innerHTML = '<b>Spoiler: </b><a href=\\'#\\' onClick=\\'return false;\\'>Show</a>';}"/><b>Spoiler: </b><a href="#" onClick="return false;">show</a></span></div><div class="quotecontent"><div style="display: none;">Snape kills Dumbledore</div></div></div>`
  ),
  testCase(`A[sub]2[/sub]`, `A<sub>2</sub>`),
  testCase(`E=mc[sup]2[/sup]`, `E=mc<sup>2</sup>`),
  testCase(
    `[youtube]f2b1D5w82yU[/youtube]`,
    `<object type="application/x-shockwave-flash" data="https://www.youtube.com/v/f2b1D5w82yU" width="644" height="390"><param name="movie" value="http://www.youtube.com/v/f2b1D5w82yU" />BORKED</object>`
  ),
];

it("should exist", () => {
  expect(BBCodeParser).toBeTruthy();
});

test("output should equal test cases", () => {
  for (const [input, output] of TEST_CASES) {
    expect(BBCodeParser.parse(input)).toEqual(output);
  }
});
