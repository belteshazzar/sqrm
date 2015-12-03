# sqrm

sqrm (pronounced squirm) is markdown, but re-imagined from a clean sheet. There are two main differences between sqrm and markdown:
1. indenting is important -- sqrm supports nesting html divs; and
2. hashtags -- sqrm uses hashtags like your use on twitter, they are fundamental to server side and client side processing.

## Inline Text Formatting

sqrm lets you format text by using two or more consecutive special characters to start or end inline formatting:
1. The number of characters that you start and end formatting with doesn't have to match, as long as its more than 2
2. If you don't match opening and closing formatting don't worry
3. All formatting is closed automatically at the end of the line. 

 style            |  tag                   | html output
------------------|------------------------| ----------------------------
bold              | `!! bold !!`           | `<b>bold</b>`
italic            | `~~ italic ~~`         | `<i>italic</i>`
underline         | `__ underline __`      | `<u>underline</u>`
strike through    | `-- strike through --` | `<del>strike through</del>`
super script      | `^^ super script ^^`   | `<sup>super script</sup>`
monospace or code | \`\`  code \`\`        |  `<code>code</code>`

All formatting can be nested like you would expect, to create bold italic text : `!!!~~ bold and italic ~~~~!!!!` creates `<b><i>bold and italic<i><b>`

#### links

Links are created by using square brackets. so `[this is a link]` becomes `<a href="this is a link">this is a link</a>`. but you might see the problem, so you can specify the link and link text separately, `[www.google.com|click here for google]` becomes `<a href="www.google.com">click here for google</a>`.

## Line Rules

In sqrm the first character of a line (after the indenting - more on that latter) can give the line special meaning. The special characters: #, =, *, | and < change the meaning of the line. If the line doesn't start with one of these characters then it is just treated as a paragraph.

### = Headings

Starting a line with any number of ='s makes the line a heading, the number of ='s specifies the heading level (6 or more creates a level 6 heading).

So:

     = Heading

creates:

     <h1>Heading</h1>

### * Lists

Starting a line with an * creates a list, the number of *'s specifies the nesting level. Lists are always numbered (you'll have to use css to make a numbered list an dot point list).

So:

    * list item
    ** sub item
    ** sub item 2
    * another list item

creates:

    <ol>
      <li>list item
        <ol>
          <li>sub item</li>
          <li>sub item 2</li>
        </ol>
      </li>
      <li>another list item</li>
    </ol>

### | Tables

Starting a line with a | creates a table. Just think of |'s as the verticle lines in a table.

So:

	  |! heading | non-heading cell |
	  | this is another | and the final cell |

creates:

    <table>
      <tr>
        <th>heading</th>
        <td>non-heading cell</td>
      </tr>
      <tr>
        <td>this is another</td>
        <td>and the final cell</td>
      <tr>
    </table>

### # Tags

... Coming soon.

### < Div's

Starting a line with a < creates a div. This is where indenting is important, as lines after a div that are indented become children of that div. Lets just show some examples.

Basic usage:

    <
      content
      of the div

creates:

    <div>
      <p>content</p>
      <p>of the div</p>
    </div>

If you put a word after the < it is the id of that div, so:

    <mydiv
      content
      of the div

creates:

    <div id="mydiv">
      <p>content</p>
      <p>of the div</p>
    </div>

Any text that you place after the div id is added to the class of that div:

    <mydiv freds-class
      content
      of the div

creates:

    <div id="mydiv" class="freds-class">
      <p>content</p>
      <p>of the div</p>
    </div>

But what happens if you use a html tag name ... sqrm recognises it and creates that tag instead:

    <article
      content of my article

creates:

    <article>
      <p>content of my article</p>
    </article>

