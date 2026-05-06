# Product metrics (Metrix)

This file lists **key metrics** you can measure for the Replenishment / Gap Scan workflow, plus **formulas**. Use consistent time windows (day/week) and scopes (store, user, WO).

## Volume & adoption

- **Active users**: count(distinct `user_id`) with ≥1 event in period
- **Work orders started**: count(distinct `wo_id`) where `wo_started_at` in period
- **Work orders completed**: count(distinct `wo_id`) where `wo_completed_at` in period
- **Completion rate (WO)**: `work_orders_completed / work_orders_started`
- **Work orders per user**: `work_orders_started / active_users`

## Speed / effort (time)

- **Task completion time (WO)**: median(`wo_completed_at - wo_started_at`)
- **P90 task completion time**: P90(`wo_completed_at - wo_started_at`)
- **Replenishment phase time**: median(`replenish_done_at - wo_started_at`)
- **Close Gap phase time**: median(`wo_completed_at - close_gap_started_at`)
- **Time per line (replenishment)**: median(`replenish_action_at - line_assigned_at`)
- **Time per scan (Close Gap)**: median(`close_gap_save_at - close_gap_scan_at`)

## Throughput

- **Lines assigned**: count(`line_id`) on WOs started in period
- **Lines completed (replenishment)**: count(`line_id`) where line outcome ∈ {Removed, Exception} (or other “done” states) in period
- **Replenishment throughput**: `lines_completed / total_replenishment_time_hours`
- **Close Gap throughput**: `close_gap_rows_saved / close_gap_time_hours`

## Quality & correctness (scanning / validation)

- **Scan accept rate (Close Gap)**: `close_gap_scans_accepted / close_gap_scans_total`
- **Scan reject rate (not in task)**: `close_gap_scans_rejected_not_in_task / close_gap_scans_total`
- **Duplicate scan rate**: `close_gap_scans_rejected_already_done / close_gap_scans_total`
- **Remove Article GTIN mismatch rate**: `remove_article_gtin_mismatch / remove_article_attempts`
- **Remove Article save success rate**: `remove_article_saves / remove_article_attempts`

## Outcome mix (what happened to lines)

- **Removed rate**: `removed_lines / total_lines_on_task`
- **Exception rate**: `exception_lines / total_lines_on_task`
- **Exception reason mix**: `count(lines where exception_reason = X) / exception_lines` (per reason X)
- **No-stock rate (Create New)**: `create_new_no_stock / create_new_total_articles`
- **Aged gap rate (+12h)**: `create_new_gaps_12h / create_new_total_articles`

## Close Gap effectiveness

- **Close Gap required total**: sum over WOs of `required_removed_lines` (quota)
- **Close Gap completion rate**: `wos_closed_gap_complete / wos_entered_close_gap`
- **Gaps closed per WO**: `close_gap_rows_saved / work_orders_in_close_gap`
- **Fill-in-full rate**: `close_gap_rows_status_full / close_gap_rows_saved`
- **Limited-stock rate**: `close_gap_rows_status_limited / close_gap_rows_saved`

## UX / reliability (prototype → product hardening)

- **Navigation backtracks**: `count(events where action='back' within N seconds of navigation)` (define N)
- **Modal cancel rate**: `modal_cancels / modal_opens` (per modal type)
- **Validation error rate**: `validation_toasts_or_errors / form_submits`
- **Crash-free sessions**: `1 - (sessions_with_errors / total_sessions)`

## Data completeness

- **Lines missing GTIN**: `count(line_id where gtin is null/empty) / total_lines_on_task`
- **RemovedMeta completeness**: `count(removed_lines where removedMeta has {location, qty, bestBefore}) / removed_lines`
- **Close Gap row completeness**: `count(rows where status in {Filled in full, Limited stock} and from/to not empty) / close_gap_rows_saved`

## Suggested event model (minimal)

To compute these, you typically need events like:

- `wo_started`, `replenish_line_done` (with outcome), `close_gap_started`, `close_gap_scan`, `close_gap_save`, `wo_completed`
- plus identifiers: `wo_id`, `line_id`, `user_id`, `store_id`, timestamps
