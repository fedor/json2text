## json2text

json2text generate free-format text from JSON templates (e.g. HTML generation).

Install package globally:
```
npm install json2text -g
```

## How to use example

### 1. Define template elements
Create file with ```.j2.node.json``` extension (e.g. ```elements.j2.node.json```). Include the following text:
```
[
	{
		"_name": "list",
		"style": "disc",
		"_text": "<ul style='list-style-type:%%style%%'>\n%%_text%%</ul>"
	}, {
		"_name": "item",
		"_text": "<li> %%_text%% </li>\n"
	}
]
```

JSON fields:
 - ```_name```: node(s) names.
 - ```_text```: node's templating string.
 - OPTIONAL: other fileds represent arguments with default values (e.g. ```style```).

### 2. Define template layout
Create file with ```.j2.json``` extension (e.g. ```layout.j2.json```). Include the following text:
```
{
	"_node":  "list",
	"style": "circle",
	"_child": [
		{"_node": "item", "_child": "list item #1"},
		{"_node": "item", "_child": "list item #2"}
	]
}
```

JSON fields:
 - ```_node```: element name
 - ```_child```: (string|object|list): node content
 - OPTIONAL: other fileds represent arguments values (e.g. ```style = circle```).

### 3. Compile template
Run:
```
j2t html
```

This command will search current work directory file-tree for ```.j2.node.json``` and ```.j2.json``` files and would compile ```.html``` output files:
```
<ul style='list-style-type:circle'>
<li> list item #1 </li>
<li> list item #2 </li>
</ul>
```

j2t produce ```.out``` files by default.

Features:
 - TBD

TODO:
 - TBD