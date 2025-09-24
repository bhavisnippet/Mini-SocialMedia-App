  // Define the current user
  const user = "You";
  const postsData = [];

  // Default posts for first load
  const defaultPosts = [
      {
          id: 1,
          author: "Alex",
          content: "Exploring the mountains today!",
          image: "https://picsum.photos/id/1025/600/400",
          likes: 4,
          createdAt: new Date().toLocaleString(),
          reactions: { "👍": [], "❤️": [], "😂": [], "🔥": ["Alex"], "😢": [] },
          comments: []
      },
      {
          id: 2,
          author: "Mira",
          content: "Coffee + Code = ❤️",
          image: "https://picsum.photos/id/1062/600/400",
          likes: 7,
          createdAt: new Date().toLocaleString(),
          reactions: { "👍": [], "❤️": ["Mira"], "😂": [], "🔥": [], "😢": [] },
          comments: []
      }
  ];

  // Save all posts (including defaults + new) to localStorage
  function savePostsToStorage() {
      localStorage.setItem("bhaviPosts", JSON.stringify(postsData));
  }

  // Load posts from localStorage or use default if none saved
  function loadPostsFromStorage() {
      const saved = JSON.parse(localStorage.getItem("bhaviPosts"));
      if (saved?.length) {
          postsData.push(...saved);
      } else {
          postsData.push(...defaultPosts);
          savePostsToStorage();
      }
  }

  // Render all posts on the page
  function renderPosts(filterAuthor = "") {
      const posts = document.getElementById("posts");
      posts.innerHTML = "";

      postsData
          .filter(post => post.author.toLowerCase().includes(filterAuthor.toLowerCase()))
          .forEach(post => {
              const div = document.createElement("div");
              div.className = "post";

              // Render reaction buttons with toggle color
              const emojiButtons = Object.entries(post.reactions).map(([emoji, users]) => {
                  const active = users.includes(user) ? 'style="background:red"' : "";
                  return `<button ${active} onclick="reactToPost(${post.id}, '${emoji}', this)">${emoji} ${users.length}</button>`;
              }).join(" ");

              const userReaction = Object.entries(post.reactions).find(([e, u]) => u.includes(user));
              const reactionInfo = userReaction ? `<div style="margin-top: 6px; font-size: 14px; color: var(--muted);">You reacted with ${userReaction[0]}</div>` : "";

              // Display comments and replies UI
              const commentsHtml = post.comments.map((c, i) => `
                  <div>
                      💬 ${c.text}
                      <div style="margin-left:15px">
                          ${c.replies.map(r => `<div>↳ ${r}</div>`).join("")}
                          <input type="text" placeholder="Reply..." onkeydown="if(event.key==='Enter'){addReply(${post.id}, ${i}, this.value); this.value='';}">
                      </div>
                  </div>`).join("");

              div.innerHTML = `
                  <h3>${post.author}</h3>
                  <div class="timestamp">${post.createdAt}</div>
                  <img src="${post.image}" alt="Post Image">
                  <p>${post.content}</p>
                  <div>${emojiButtons}</div>
                  ${reactionInfo}
                  <button onclick="likePost(${post.id})">Like</button>
                  <input type="text" id="commentInput-${post.id}" placeholder="Write a comment...">
                  <button onclick="addComment(${post.id}, document.getElementById('commentInput-${post.id}').value); document.getElementById('commentInput-${post.id}').value = '';">Comment</button>
                  <button onclick="sharePost()">Share</button>
                  ${post.author === "You" ? `<button onclick="deletePost(${post.id})">❌ Delete</button>` : ""}
                  <div class="post-footer">Likes: ${post.likes} | Comments: ${post.comments.length}</div>
                  <div class="comments-container">${commentsHtml}</div>
              `;
              posts.appendChild(div);
          });
  }

  function showEmojiBurst(emoji, element) {
      const burst = document.createElement("div");
      burst.className = "emoji-burst";
      burst.textContent = emoji;

      const rect = element.getBoundingClientRect();
      burst.style.left = `${rect.left + rect.width / 2}px`;
      burst.style.top = `${rect.top - 10 + window.scrollY}px`;
      burst.style.position = "absolute";

      document.body.appendChild(burst);

      setTimeout(() => {
          burst.remove();
      }, 800);
  }


  // Toggle emoji reaction (one per user)

  function reactToPost(id, emoji, btn) {
      const post = postsData.find(p => p.id === id);
      if (!post) return;
      for (let e in post.reactions) {
          post.reactions[e] = post.reactions[e].filter(u => u !== user);
      }
      post.reactions[emoji].push(user);
      savePostsToStorage();

      btn.classList.add("reaction-animate");
      showEmojiBurst(emoji, btn);
      setTimeout(() => btn.classList.remove("reaction-animate"), 400);

      renderPosts(document.getElementById("searchAuthor").value);
  }

  // Increment like count
  function likePost(id) {
      const post = postsData.find(p => p.id === id);
      if (post) {
          post.likes++;
          savePostsToStorage();
          renderPosts(document.getElementById("searchAuthor").value);
      }
  }

  // Add a comment to a post
  function addComment(id, text) {
      const post = postsData.find(p => p.id === id);
      if (post && text.trim()) {
          post.comments.push({ text: text.trim(), replies: [] });
          savePostsToStorage();
          renderPosts(document.getElementById("searchAuthor").value);
      }
  }

  // Add a reply to a comment
  function addReply(id, i, replyText) {
      const post = postsData.find(p => p.id === id);
      if (post && replyText.trim()) {
          post.comments[i].replies.push(replyText.trim());
          savePostsToStorage();
          renderPosts(document.getElementById("searchAuthor").value);
      }
  }

  // Delete a user-created post
  function deletePost(id) {
      const index = postsData.findIndex(p => p.id === id && p.author === "You");
      if (index !== -1 && confirm("Delete this post?")) {
          postsData.splice(index, 1);
          savePostsToStorage();
          renderPosts(document.getElementById("searchAuthor").value);
      }
  }

  // Copy site URL to clipboard
  function sharePost() {
      navigator.clipboard.writeText(location.href);
      alert("Link copied!");
  }

  // Handle new post form submission
  document.getElementById("postForm").addEventListener("submit", e => {
      e.preventDefault();
      const caption = document.getElementById("postInput").value.trim();
      const file = document.getElementById("imageInput").files[0];
      if (!caption || !file) return alert("Add both caption and image");

      const reader = new FileReader();
      reader.onload = () => {
          const newPost = {
              id: Date.now(),
              author: "You",
              content: caption,
              image: reader.result,
              likes: 0,
              createdAt: new Date().toLocaleString(),
              reactions: { "👍": [], "❤️": [], "😂": [], "🔥": [], "😢": [] },
              comments: []
          };
          postsData.unshift(newPost);
          savePostsToStorage();
          document.getElementById("postInput").value = "";
          document.getElementById("imageInput").value = "";
          renderPosts();
      };
      reader.readAsDataURL(file);
  });

  // Filter posts by author name
  document.getElementById("searchAuthor").addEventListener("input", e => {
      renderPosts(e.target.value);
  });

  // Toggle between dark and light mode
  function applyTheme() {
      const isDark = localStorage.getItem("theme") === "dark";
      document.body.classList.toggle("dark", isDark);
      document.getElementById("toggleTheme").textContent = isDark ? "☀️ Light" : "🌙 Dark";
  }

  document.getElementById("toggleTheme").addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      applyTheme();
  });

  // Initialize app
  applyTheme();
  loadPostsFromStorage();
  renderPosts();