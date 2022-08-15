- Add Quick Log feature to easily log everything that has happened in a single post
- Allow custom fields for Pokémon profiles (straight replacement only) to allow for extra customization
- Template / Customization Overhaul
    - Dedicated Template editing page
    - Editable Templates for Items, Wallet, Bond
    - Preset Templates to pick from
        - (Send examples from your existing trainer pages!)
    - Less hardcoded results! More templates for things in move lists, other lists, evolution chain, etc!
    - Theoretical new template syntax:
        - All spaces stripped from template before processing so sprinkle however many you want for the sake of readability.
        - Examples:
            - [size=4]{{ name: #predefinedColor }}[/size]
                - Color the name field with a predefined color (editable in template settings)
            - {{ Beauty #9DB7F5: beautifulBBCode #9DB7F5 }}
                - Color the beauty contest state with a hard coded color (if there's no matching predefined color, just use the text directly)
            - {{ Type: type & Ability: ability & Nature: nature? }}
                - Show Type, Ability, and Nature on the same line with separators between (again customizable)
                - Nature will not show up if it has a blank value.
        - With all options:
            - `{{ (label(#color)(+wrappingTag:otherField):)(field)(?)(@link)(#color)(+wrappingTag:otherField) (& more fields...)}}`
- Get Google Drive syncing working in an easy-to-use and unobtrusive way
- Autofill Pokemon data from FizzyDex data