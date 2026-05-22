# IDEA — The customer-as-developer use case I noticed

While wiring nokta-audit into this host, the interesting thing was not any single
bug — it was what the **report format itself** does to the repair workflow.

In a normal issue tracker, a customer writes "the button looks weird" and a
developer spends most of the repair budget just *reconstructing context*: which
screen, which device, what exactly looked wrong. The expensive part isn't the
fix, it's the triage. nokta-audit collapses that triage to near zero: the burn-in
screenshot is visual ground truth, and `currentScreen` makes the screen → file
mapping deterministic. So the report stops being a *request to a developer* and
becomes a *complete work order an agent can execute*. The customer, without
writing a line of code, has effectively authored the spec for the change.

The concrete use case I'd build on top of this composition: **a "feature request"
lane in the same FAB**. Today every audit note is implicitly a bug ("this is
broken"). But cycle 5 in my forge run started from a note that was really a
feature request — "when the list is empty it should say something." That note
flowed through the *exact same* pipeline (capture → `.md` → forge cycle → commit)
and produced new behaviour, not just a fix. So the natural next slice is to let
the capturing customer tag intent at capture time (`bug` vs `idea`), and let the
forge agent branch on it: a `bug` runs the minimal-diff ratchet; an `idea` runs a
slightly wider cycle that also writes a test and a golden scenario before
committing. The burn-in box on a feature note then means "put the new thing
*here*", which is a surprisingly precise spec for generative UI work.

That is the thesis in miniature: when capture is this cheap and this grounded,
the boundary between "customer reporting" and "developer specifying" disappears.
The customer becomes the developer — they just express intent visually, and the
agent does the typing.
