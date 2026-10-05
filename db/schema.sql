-- Aggregate counters only (DEC-006, DEC-015). No IP, user agent, cookie or identifier is stored.
CREATE TABLE IF NOT EXISTS event_counters (
  day      date   NOT NULL,
  kind     text   NOT NULL,   -- view | answer_correct | answer_wrong | sim_passed | sim_failed
  topic    text   NOT NULL DEFAULT '',
  item     text   NOT NULL DEFAULT '',  -- page name or question id
  count    bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind, topic, item)
);
