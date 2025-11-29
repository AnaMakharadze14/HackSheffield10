function setStep(stepNumber) {
    const steps = document.querySelectorAll(".step");

    steps.forEach((step, index) => {
        step.classList.remove("completed", "active");

        if (index < stepNumber - 1) {
            step.classList.add("completed");
        } else if (index === stepNumber - 1) {
            step.classList.add("active");
        }
    });
}