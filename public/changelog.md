### v0.2.2
- Add Terra Type to Pokemon info
- Combine Wallet Output, change Watts to LP
- Fix bug on Bond page if Pokemon had no current bond logs

### v0.2.1
- Calendars now properly show dates using the UTC timezone
- Bond Page rework
  - Summary section redone to allow for editing one Pokemon's bond logs and bond styling output options in a modal
  - BBCode output reworked so the page will no longer be redoing everything when any single thing changes
- The modal forms that show up when editing things no longer close when clicking outside of them
- Post Summaries page "Add New Summary" modal no longer crashes upon touching anything at all

### v0.2.0
- New Feature Added: Post Summaries
  - Warning: Page may sometimes freeze up as the code thinks really hard.
  - A "one-stop-shop" like page where you can record everything that's happened in one RP post!
    - Wallet Changes: Pokedollars, Rare Candies, ~~Watts~~ League Points
    - Item Changes
    - **Pokemon Changes!** Record changes to an existing pokemon or import directly from the FizzyDex!
      - Only changes that can have a link associated with them, including levels, bond, new moves, and contest stats (for those who bother with them)
  - Summaries are also automatically generated for old posts by collecting together links!
    - However, they may end up marked as (Undated) and put to the bottom of the list.

### v0.1.10

- Improvement: Pokemon Page
    - FizzyDex data can now be imported into Pokemon's entries. You can import to a new Pokemon or to the
      Pokemon you are currently editing.

### v0.1.9

- Improvement: Pokemon Page
    - Move Lists and the Special Statuses List can now have their rows be freely reordered.

### v0.1.8a

- Improvement: BBCode counter now more strictly strips BBCode and counts words with code borrowed
  from [writtenkitten.co]().
  This should result in word counts that agree (more often) with external sources.

### v0.1.8

- Fix BBCode: URLs with "?" in them are no longer broken when rendering the BBCode.
- Improvement Word Counter: Word count should now be more accurate to other word counters.

### v0.1.7

- Fix Pokemon Page
    - "dropdown" / select fields should work now (Gender, Owning Trainer)
    - Level Logs are now properly sorted by level

### v0.1.6

- Fix: Trainer, Pokemon Pages - Editing long text boxes should no longer randomly set your position to end of text.
- Changed: Loading spinner shows up on changing pages, close nav bar on page change on mobile
- Feature: Pokemon - Added "Special Statuses" field for tracking things like Shadow, Shiny, GMax Factor, whatever else
  you want.
    - (If you've changed the template, add in {{specialStatusesBBCode}} to be able to see it.)

### v0.1.5

- Fix: Pokemon Page - Bond shows up as 30 in edit area

### v0.1.4

- Actually fix Textarea on Firefox. Thanks to @blu3shift

### v0.1.3

- Fix: Items Page - Summary - Add New Item button not working if no items exist
- Changed: Items Page - Summary - Added Delete button (with confirmation popup) to accompany the Edit button.
- Changed: Items Page - Details - Reorganized so the order is now Definitions then Logs
- Changed: Home Page - Split up Change Log and SOON(TM) stuff. Hide full length of stuff by default.

### v0.1.2

- Fix: Spreadsheet imports "Female" as "Male"

### v0.1.1

- Feature: Home Page - Improved Change Log
- Fix: Pokémon Page - Evolution Stage 3 Method Link input changing wrong field
- Fix: Settings Page - Textarea does not have line breaks on Firefox
- Fix: Bond Page - Output dates appearing as "+0000"
- Fix: Spreadsheet Import loads "Gender" into "Ability"

### v0.1 - Initial Release

- Pages: Trainers, Pokemon, Items, Wallet, Bond, Word Counter, Settings, and a hidden-by-default Data page.
- Feature: Import from spreadsheet downloaded as a copy of the previous tracker that was based in Google Sheets.
- Feature: Import (Upload) from and Export (Download) to file on your local device.
