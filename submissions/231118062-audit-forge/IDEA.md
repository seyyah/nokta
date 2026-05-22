# IDEA

This submission treats the audit widget as a removable primitive, not as the app's product logic. The useful customer-developer pattern is small: a tester marks a precise visual problem, exports a Markdown artifact, and the coding agent receives enough context to make one focused change without asking for a reproduction script.

For Track A, the main idea is discipline rather than novelty. The host app owns native capture, file writing, sharing and storage. The widget receives those capabilities through `deps`, while the rest of the app keeps working if the mount line is removed from the root layout.
