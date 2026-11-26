import { useCallback, useEffect, useRef, useState } from "react";
import { listExpenses } from "../api/client.js";
import {
  isValidISODate,
  monthStartISO,
  shiftDaysISO,
  todayISO,
  yearStartISO,
} from "../lib/dates.js";

export const REPORT_PRESETS = {
  ALL_TIME: "all-time",
  THIS_MONTH: "this-month",
  LAST_90_DAYS: "last-90-days",
  THIS_YEAR: "this-year",
  CUSTOM: "custom",
};

export const MAX_DAILY_RANGE_DAYS = 366;

export const MAX_MONTHLY_RANGE_MONTHS = 120;

function parseISODate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function daysBetweenInclusive(from, to) {
  return (
    Math.floor(
      (parseISODate(to) - parseISODate(from)) / (24 * 60 * 60 * 1000),
    ) + 1
  );
}

export default function useReportRange(refreshKey) {
  const initialToday = todayISO();
  const [activePreset, setActivePresetState] = useState(
    REPORT_PRESETS.THIS_MONTH,
  );
  const activePresetRef = useRef(REPORT_PRESETS.THIS_MONTH);
  const [range, setRange] = useState(null);
  const [draftFrom, setDraftFrom] = useState(monthStartISO());
  const [draftTo, setDraftTo] = useState(initialToday);
  const [bounds, setBounds] = useState(null);
  const [boundsLoading, setBoundsLoading] = useState(true);
  const [boundsError, setBoundsError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [boundsRetryKey, setBoundsRetryKey] = useState(0);

  const setActivePreset = useCallback((preset) => {
    activePresetRef.current = preset;
    setActivePresetState(preset);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBounds() {
      setBoundsLoading(true);
      setBoundsError("");

      try {
        const firstPage = await listExpenses(
          { limit: 1, offset: 0 },
          { signal: controller.signal },
        );

        if (firstPage.total === 0) {
          setBounds({ earliest: null, latest: null, total: 0 });

          if (activePresetRef.current === REPORT_PRESETS.ALL_TIME) {
            setRange(null);
          }

          return;
        }

        const latest = firstPage.rows[0];
        let earliest = latest;

        if (firstPage.total > 1) {
          const lastPage = await listExpenses(
            { limit: 1, offset: firstPage.total - 1 },
            { signal: controller.signal },
          );

          earliest = lastPage.rows[0] ?? latest;
        }

        setBounds({
          earliest: earliest.expense_date,
          latest: latest.expense_date,
          total: firstPage.total,
        });

        if (range === null) {
          if (activePresetRef.current === REPORT_PRESETS.ALL_TIME) {
            const nextRange = {
              from: earliest.expense_date,
              to: latest.expense_date,
            };

            setRange(nextRange);
            setDraftFrom(nextRange.from);
            setDraftTo(nextRange.to);
            setValidationError("");
          } else {
            const end = todayISO();
            let start = end;

            if (activePresetRef.current === REPORT_PRESETS.THIS_MONTH) {
              start = monthStartISO();
            } else if (
              activePresetRef.current === REPORT_PRESETS.LAST_90_DAYS
            ) {
              start = shiftDaysISO(end, -89);
            } else if (activePresetRef.current === REPORT_PRESETS.THIS_YEAR) {
              start = yearStartISO();
            }

            const nextRange = { from: start, to: end };

            setRange(nextRange);
            setDraftFrom(nextRange.from);
            setDraftTo(nextRange.to);
            setValidationError("");
          }
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setBoundsError(
            requestError.message || "Could not determine the available dates.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setBoundsLoading(false);
        }
      }
    }

    loadBounds();

    return () => controller.abort();
  }, [boundsRetryKey, refreshKey, range]);

  const applyRange = useCallback(
    (nextRange, preset) => {
      setActivePreset(preset);
      setRange(nextRange);
      setDraftFrom(nextRange.from);
      setDraftTo(nextRange.to);
      setValidationError("");
    },
    [setActivePreset],
  );

  const applyPreset = useCallback(
    (preset) => {
      setValidationError("");

      if (preset === REPORT_PRESETS.ALL_TIME) {
        setActivePreset(REPORT_PRESETS.ALL_TIME);

        if (bounds && bounds.total > 0) {
          applyRange(
            { from: bounds.earliest, to: bounds.latest },
            REPORT_PRESETS.ALL_TIME,
          );
        } else {
          setRange(null);

          if (boundsError) {
            setBoundsRetryKey((current) => current + 1);
          }
        }

        return;
      }

      const end = todayISO();
      let start = end;

      if (preset === REPORT_PRESETS.THIS_MONTH) {
        start = monthStartISO();
      } else if (preset === REPORT_PRESETS.LAST_90_DAYS) {
        start = shiftDaysISO(end, -89);
      } else if (preset === REPORT_PRESETS.THIS_YEAR) {
        start = yearStartISO();
      }

      applyRange({ from: start, to: end }, preset);
    },
    [applyRange, bounds, boundsError, setActivePreset],
  );

  const applyCustomRange = useCallback(() => {
    const from = draftFrom.trim();
    const to = draftTo.trim();

    if (!isValidISODate(from) || !isValidISODate(to)) {
      setValidationError("Choose a valid start and end date.");
      return false;
    }

    if (from > to) {
      setValidationError("The start date must be on or before the end date.");
      return false;
    }

    const days = daysBetweenInclusive(from, to);

    if (days > MAX_DAILY_RANGE_DAYS) {
      setValidationError(
        `Daily reports cover at most ${MAX_DAILY_RANGE_DAYS} days. Pick a shorter range or use a monthly category report.`,
      );
      return false;
    }

    applyRange({ from, to }, REPORT_PRESETS.CUSTOM);
    return true;
  }, [applyRange, draftFrom, draftTo]);

  const retry = useCallback(() => {
    setBoundsRetryKey((current) => current + 1);
  }, []);

  return {
    activePreset,
    applyCustomRange,
    applyPreset,
    bounds,
    draftFrom,
    draftTo,
    error: activePreset === REPORT_PRESETS.ALL_TIME ? boundsError : "",
    hasNoExpenses:
      !boundsLoading && !boundsError && bounds !== null && bounds.total === 0,
    loading:
      boundsLoading &&
      activePreset === REPORT_PRESETS.ALL_TIME &&
      range === null,
    maxMonthlyRangeMonths: MAX_MONTHLY_RANGE_MONTHS,
    range,
    retry,
    setDraftFrom,
    setDraftTo,
    validationError,
  };
}
