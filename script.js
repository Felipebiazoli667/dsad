document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("poem-content");
  const postButton = document.getElementById("post-poem");
  const container = document.getElementById("poems-container");

  // Remover a mensagem de boas-vindas após a animação
  const welcomeEl = document.getElementById("welcome");
  setTimeout(() => {
    if (welcomeEl) {
      welcomeEl.remove();
    }
  }, 5000);

  // Carrega os poemas do servidor
  function loadPoems() {
    fetch('/api/poems')
      .then(response => response.json())
      .then(data => {
        container.innerHTML = "";
        data.poems.forEach(poem => {
          const col = document.createElement("div");
          col.className = "col-12 col-md-6";

          const card = document.createElement("div");
          card.className = "card position-relative poem-card shadow-sm";

          const cardBody = document.createElement("div");
          cardBody.className = "card-body";

          // Conteúdo do poema
          const pre = document.createElement("pre");
          pre.textContent = poem.content;
          pre.className = "pre-poem mb-3";
          pre.setAttribute("data-id", poem.id);

          // Ações: Editar e Excluir
          const actions = document.createElement("div");
          actions.className = "poem-actions";

          const editButton = document.createElement("button");
          editButton.className = "btn btn-sm btn-warning me-1";
          editButton.textContent = "Editar";
          editButton.addEventListener("click", () => editPoem(poem.id, pre));

          const deleteButton = document.createElement("button");
          deleteButton.className = "btn btn-sm btn-danger";
          deleteButton.textContent = "Excluir";
          deleteButton.addEventListener("click", () => deletePoem(poem.id));

          actions.appendChild(editButton);
          actions.appendChild(deleteButton);

          cardBody.appendChild(actions);
          cardBody.appendChild(pre);
          card.appendChild(cardBody);
          col.appendChild(card);
          container.appendChild(col);
        });
      })
      .catch(err => console.error("Erro ao carregar poemas:", err));
  }

  // Posta um novo poema
  postButton.addEventListener("click", () => {
    const content = textarea.value.trim();
    if (content === "") {
      alert("Digite um poema antes de postar!");
      return;
    }
    fetch('/api/poems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(() => {
      textarea.value = "";
      loadPoems();
    })
    .catch(err => console.error("Erro ao postar poema:", err));
  });

  // Edita um poema (modo inline)
  function editPoem(id, preElement) {
    const currentContent = preElement.textContent;
    const textareaEdit = document.createElement("textarea");
    textareaEdit.className = "form-control editable mb-2";
    textareaEdit.value = currentContent;
    textareaEdit.rows = 4;
    preElement.replaceWith(textareaEdit);

    // Cria botões de Salvar e Cancelar
    const btnGroup = document.createElement("div");
    btnGroup.className = "mb-2 text-end";

    const saveButton = document.createElement("button");
    saveButton.className = "btn btn-sm btn-success me-1";
    saveButton.textContent = "Salvar";
    saveButton.addEventListener("click", () => {
      const newContent = textareaEdit.value.trim();
      if (newContent === "") {
        alert("O conteúdo do poema não pode ficar vazio.");
        return;
      }
      fetch(`/api/poems/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      })
      .then(response => response.json())
      .then(() => {
        loadPoems();
      })
      .catch(err => console.error("Erro ao atualizar poema:", err));
    });

    const cancelButton = document.createElement("button");
    cancelButton.className = "btn btn-sm btn-secondary";
    cancelButton.textContent = "Cancelar";
    cancelButton.addEventListener("click", loadPoems);

    btnGroup.appendChild(saveButton);
    btnGroup.appendChild(cancelButton);
    textareaEdit.parentNode.insertBefore(btnGroup, textareaEdit);
  }

  // Exclui um poema
  function deletePoem(id) {
    if (confirm("Tem certeza que deseja excluir este poema?")) {
      fetch(`/api/poems/${id}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(() => {
        loadPoems();
      })
      .catch(err => console.error("Erro ao excluir poema:", err));
    }
  }

  // Carrega os poemas ao iniciar
  loadPoems();
});
