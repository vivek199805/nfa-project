import { useEffect, useRef } from "react";
import { getResumeStep } from "../common/entry-step";

export function useResumeWorkflowStep({ id, activeStep, stepsLength, setActiveSection }) {
  const resumedEntryIdRef = useRef(null);

  useEffect(() => {
    if (!id) {
      resumedEntryIdRef.current = null;
      return;
    }

    if (activeStep == null || resumedEntryIdRef.current === id) return;

    setActiveSection(getResumeStep(activeStep, stepsLength));
    resumedEntryIdRef.current = id;
  }, [activeStep, id, setActiveSection, stepsLength]);
}
