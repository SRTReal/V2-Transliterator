document.addEventListener('DOMContentLoaded', () => {
  const lexiconList = document.getElementById('lexicon');

  if (!lexiconList) {
    console.error('Element with id "lexicon" not found.');
    return;
  }

  const grammaticalOrder = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'suffix','conjunction', 'interjection'];

  async function displayLexicon() {
    let lexiconEntries = await fetch("http://localhost:3001/entries")
      .then(res => res.json())
      .catch(err => {
        console.error("Failed to fetch entries from database", err);
        return [];
      });

    lexiconEntries.sort((a, b) => {
      const indexA = grammaticalOrder.indexOf((a.grammar || "").toLowerCase());
      const indexB = grammaticalOrder.indexOf((b.grammar || "").toLowerCase());
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    lexiconList.innerHTML = '';

    const headerRow = document.createElement('li');
    headerRow.className = 'header-row';
    headerRow.innerHTML = `
      <div class="header-item"></div>
      <div class="header-item">WORD</div>
      <div class="header-item">GRAMMATICAL TERM</div>
      <div class="header-item">DEFINITION</div>
      <div class="header-item">ADDITIONAL INFORMATION</div>
    `;
    lexiconList.appendChild(headerRow);

    if (lexiconEntries.length === 0) {
      console.log('No lexicon entries to display.');
      return;
    }

    lexiconEntries.forEach((entry) => {
      const listItem = document.createElement('li');
      listItem.className = 'lexicon-item';

      const deleteButtonContainer = document.createElement('div');
      deleteButtonContainer.className = 'delete-container';
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.className = 'delete-button';

      deleteButton.addEventListener('click', () => {
        fetch(`http://localhost:3001/delete/${entry.id}`, {
          method: 'DELETE'
        })
        .then(() => displayLexicon())
        .catch(err => console.error("Failed to delete", err));
      });

      deleteButtonContainer.appendChild(deleteButton);

      const termItem = document.createElement('div');
      termItem.className = 'term-item';
      termItem.textContent = entry.term;

      const grammarItem = document.createElement('div');
      grammarItem.className = 'grammar-item';
      grammarItem.contentEditable = 'true';
      grammarItem.innerHTML = entry.grammar || 'Enter Grammar';  // use innerHTML

      grammarItem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          grammarItem.blur(); // save on Enter
        }
      });

      grammarItem.addEventListener('blur', (event) => {
        const updatedGrammar = event.target.innerHTML.trim();  // use innerHTML
        if (updatedGrammar !== entry.grammar) {
          entry.grammar = updatedGrammar;
          updateEntry(entry);
        }
      });

      const definitionItem = document.createElement('div');
      definitionItem.className = 'definition-item';
      definitionItem.contentEditable = 'true';
      definitionItem.innerHTML = entry.definition || 'Enter a Definition';

      definitionItem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          definitionItem.blur();
        }
      });

      definitionItem.addEventListener('blur', (event) => {
        const updatedDefinition = event.target.innerHTML.trim();
        if (updatedDefinition !== entry.definition) {
          entry.definition = updatedDefinition;
          updateEntry(entry);
        }
      });

      const additionalInfoItem = document.createElement('div');
      additionalInfoItem.className = 'additional-info-item';
      additionalInfoItem.contentEditable = 'true';
      additionalInfoItem.innerHTML = entry.additionalInfo || 'Enter Additional Info';  // use innerHTML

      additionalInfoItem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          additionalInfoItem.blur(); // save on Enter
        }
      });

      additionalInfoItem.addEventListener('blur', (event) => {
        const updatedAdditionalInfo = event.target.innerHTML.trim();  // use innerHTML
        if (updatedAdditionalInfo !== entry.additionalInfo) {
          entry.additionalInfo = updatedAdditionalInfo;
          updateEntry(entry);
        }
      });

      listItem.appendChild(deleteButtonContainer);
      listItem.appendChild(termItem);
      listItem.appendChild(grammarItem);
      listItem.appendChild(definitionItem);
      listItem.appendChild(additionalInfoItem);
      lexiconList.appendChild(listItem);
    });

    function updateEntry(entry) {
      fetch(`http://localhost:3001/update/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      }).catch(err => console.error("Update failed:", err));
    }
  }

  // ✅ Initial display call
  displayLexicon();
});
