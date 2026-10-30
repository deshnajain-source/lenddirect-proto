# Grill UI

A web front end where a person describes a plan and is then interviewed about it, one question at a time, by the grill-with-docs skill.

## Language

**Brief**:
The free-text plan or idea the user submits to be grilled.
_Avoid_: Description, desc, prompt

**Grilling Session**:
One interview about a single Brief, from submission until the user confirms shared understanding.
_Avoid_: Chat, conversation

**Round**:
The set of questions the skill asks together, all of which can be answered without waiting on each other.
_Avoid_: Batch, step

**Question**:
A single decision put to the user within a Round.
_Avoid_: Prompt

**Recommendation**:
The answer the skill proposes for a Question; accepting it means answering "yes".
_Avoid_: Default, suggestion
