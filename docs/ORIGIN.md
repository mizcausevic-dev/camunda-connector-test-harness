# Why We Built This

Connector demos are usually optimized for one thing: proving that a request can be sent. That is useful for a first pass, but it is not enough for teams that need to trust outbound connectors inside production workflows. In real environments, the harder questions arrive immediately after the first request succeeds. What happens when a required variable is missing? What happens when a credential placeholder silently falls back to a static token? What should retry, and what should fail fast? Can an operator explain why a connector replayed or halted?

That is the problem `camunda-connector-test-harness` is built around. We wanted a repo that treated outbound connector testing as an operational surface, not just a code sample. The goal was to make the behavior around contract validation, secret replacement, and failure simulation visible enough that a workflow or platform team could review it before rollout.

Existing examples usually miss the mark in one of two ways. Some are so narrow that they only show a happy-path payload. Others hide the real behavior inside worker internals or BPMN project wiring, which makes the connector difficult to reason about in isolation. Neither approach gives a reviewer a fast way to see whether the test setup is proving the things that actually matter.

The design philosophy here is simple:

- keep scenario expectations explicit
- keep secret posture visible
- keep retry and fail-fast behavior easy to explain

That is why the repo separates the connector story into multiple surfaces. The scenario matrix shows what each connector expects and should produce. The secret replacement surface shows whether credentials are actually being injected safely. The failure lab models what should retry, what should stop, and what should escalate. The verification view ties those lanes together into one review posture.

The same state is also exposed through JSON routes so the repo can support tests, automation, or future workflow tooling without losing clarity. The value is not pretending these sample scenarios are live Camunda runtime data. The value is in showing what a serious connector harness should make visible before teams depend on it.

What comes next would be richer contract fixtures, BPMN-variable import/export samples, and connector-worker-specific replay cases. The important first step, though, is already here: a connector harness that reads like workflow infrastructure, not just another example app.
