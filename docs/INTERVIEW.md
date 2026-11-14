# Interview preparation: SupplyChain360

## A concise demonstration

Find Precision sensor and change stock to zero. Verify the out-of-stock alert and reload to check persistence. Review the suggested order, then restore stock to 145.

Explain the problem, demonstrate a decision-changing input, trace it to a pure domain function, and show a test for its boundary behaviour. Describe the AI assistance honestly and explain what you have personally reviewed or extended.

## Questions to practise

### Why does incoming stock affect order quantity but not stock status?

Stock status measures on-hand exposure today. Incoming orders reduce the target replenishment quantity, but without arrival dates cannot eliminate shortage risk.

### Explain the reorder point.

Expected daily demand multiplied by lead time plus safety stock. Here safety stock is a user assumption; a production system could derive it from variability and service-level targets.

### Why weighted demand?

The most recent period gets 50%, the middle 30% and oldest 20%. This reacts to change while remaining interpretable; it needs backtesting against alternative baselines.

### How would you evaluate supplier risk?

Discuss lead-time variability, concentration, delivery performance and quality. This demo uses a transparent 60/40 score; those weights should be agreed with stakeholders.

### How did you handle unreliable browser storage?

Reads are parsed and validated; failures return a cloned demo dataset with a warning. Writes return a success flag. The user is told when edits are temporary. A future backend would replace the storage adapter and add conflict detection.

### How did you make charts accessible?

Interactive marks use native buttons with descriptive names. Tables or textual values expose the data, and meaning is not conveyed only through colour. Filters use labelled native controls. Formal assistive-technology testing remains a separate activity.

### What did testing establish?

Unit tests exercise business examples and edge cases such as zero demand, threshold boundaries or declining forecasts, as applicable. They also cover corrupt storage and formula-safe exports. Explain the difference between those guarantees and browser or production validation.

## Practical extension exercise

Add one stakeholder-driven feature with an acceptance example, implement it at the correct boundary and add a regression test. Good options are forecast backtesting, supplier delivery-date tracking or a risk review history. Avoid inventing impact metrics or client results; use measured test outcomes from your own work.
