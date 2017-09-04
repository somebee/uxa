# Basics

This one of the main differentiators of Imba. The language has native support for tags. Tags are in fact native DOM elements, with a very lightweight wrapper that provides additional functionality and extensibility.

## Defining

Tags are basically a separate Class hierarchy with syntactic sugar for instantiating nodes. All html elements are predefined, but you can also extend these tags, or inherit from them with your own tags. The syntax for creating new tags is very similar to our class syntax.

## Cascading inheritance

Custom tags still use native supported node types in the DOM tree. Our `<sketchpad>` will render as a `<canvas class='_sketchpad'>` in the DOM, while
`<task>` will render as `<li class='_entry _task'>`. This means that css/styling can also be inherited, and we can use query selectors to select all entries (including inherited tags project and task).

---

Imba is a new programming language for the web that compiles
to performant JavaScript. It is heavily inspired by ruby and python, but developed explicitly for web programming (both server and client). It has language level 
support for defining, extending, subclassing, instantiating 
and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than [10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html)
with less code, and a much smaller library.

> Tip! When compiling files and folders without specifying an output location Imba will follow a specific convention. If the path includes a src/ directory, and there is a sibling lib/ directory, Imba will automatically choose this path. If you have the directories `/myapp/src` and `/myapp/lib`, running `> imba compile /myapp/src/app.imba` will by default write the compiled code to `/myapp/lib/app.js`.
