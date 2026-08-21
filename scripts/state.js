(() => {
  const appState = {
    activeQuestion: null,
    activeTransmission: null
  };

  function setActiveQuestion(question) {
    appState.activeQuestion = {
      id: `question_${Date.now()}`,
      targetName: question.targetName,
      questionText: question.questionText,
      createdAt: new Date().toISOString()
    };

    return appState.activeQuestion;
  }

  function getActiveQuestion() {
    return appState.activeQuestion;
  }

  function setActiveTransmission(transmission) {
    appState.activeTransmission = transmission;
    return appState.activeTransmission;
  }

  function getActiveTransmission() {
    return appState.activeTransmission;
  }

  function clearActiveTransmission() {
    appState.activeTransmission = null;
  }

  window.UnknownMessageState = {
    setActiveQuestion,
    getActiveQuestion,
    setActiveTransmission,
    getActiveTransmission,
    clearActiveTransmission
  };
})();
