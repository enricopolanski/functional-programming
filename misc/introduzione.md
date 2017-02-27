# Che vantaggi ha il functional programming?

What I mean by code being “easy to reason about (dependably/correctly/rigorously)” is that the code has precise and simple meaning as math. And that this relationship between code and its math meaning is “compositional”, i.e., that the meaning of a compound expression is a (precise & simple) function of the meanings of the component expressions, so that reasoning about the code corresponds simply & predictably with reasoning about the math. What Peter Landin called “denotative” as a substantive replacement for the fuzzy terms “functional”, “declarative”, or “non-procedural” - Conal Elliott on Medium

Typically when writing a program, your job doesn't end with merely writing the code, but you would also want to know some properties your code exhibits. You can arrive at these properties by two means: either by logical analysis or by empirical observation.

Examples of such properties include:

- correctness (does the program do what it is supposed to)
- performance (how long does it take)
- scalability (how is performance affected with input)
- security (can the algorithm be maliciously misused)

When you measure these properties empirically, you get results with limited precision. Therefore mathematically proving these properties is far superior, however it is not always easy to do. Functional languages typically have as one of their design goals making mathematical proofs of their properties more tractable. This is what is typically meant by reasoning about programs. - Jakub Hampl on StackOverflow


