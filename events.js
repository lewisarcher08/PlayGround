/* PARASOCIAL — controls and input. */

document.addEventListener("click", (event) => {
  const backdrop = event.target.closest("[data-close]");
  if (backdrop && event.target === backdrop) {
    closeOverlay();
    return;
  }

  const actionEl = event.target.closest("[data-action]");
  if (actionEl) {
    const action = actionEl.dataset.action;
    if (action === "begin") {
      haptic(10);
      state.screen = "identity";
      render();
      return;
    }
    if (action === "identity-back") {
      state.screen = "splash";
      render();
      return;
    }
    if (action === "continue-identity") {
      startRun();
      state.screen = "intro";
      render();
      haptic(12);
      return;
    }
    if (action === "open-feed") {
      state.screen = "feed";
      render();
      haptic(14);
      return;
    }
    if (action === "notifications") {
      openActivitySheet();
      return;
    }
    if (action === "profile") {
      openProfileSheet();
      return;
    }
    if (action === "close-overlay") {
      closeOverlay();
      return;
    }
    if (action === "compose") {
      openComposer();
      return;
    }
    if (action === "publish") {
      publishFromComposer();
      return;
    }
    if (action === "result-continue") {
      const result = state.lastResult;
      if (result && (result.exposed || result.final)) {
        finishRun();
      } else {
        state.screen = "feed";
        render();
      }
      return;
    }
    if (action === "scanner-close") {
      closeOverlay();
      updateHud();
      return;
    }
    if (action === "echo-close") {
      closeOverlay();
      updateHud();
      toast("Echo archived. The feed feels different now.", "ghost");
      return;
    }
    if (action === "enable-motion") {
      enableTilt().then((enabled) => {
        if (!enabled) return;
        if (scanner) renderScanner();
        else if (isOverlayOpen()) openProfileSheet();
      });
      return;
    }
    if (action === "open-scan") {
      openScanner();
      return;
    }
    if (action === "end-night") {
      openEndConfirm();
      return;
    }
    if (action === "confirm-end") {
      finishRun();
      return;
    }
    if (action === "share") {
      shareResult();
      return;
    }
    if (action === "replay") {
      clearTimeout(postingTimer);
      state.run = null;
      state.screen = "identity";
      state.lastResult = null;
      state.ending = null;
      state.compose = null;
      closeOverlay();
      render();
      haptic(15);
      return;
    }
    if (action === "motion-toggle") {
      if (state.motionEnabled) {
        toast("Tilt is already enabled. Sweep the scanner.", "motion");
        return;
      }
      enableTilt().then((enabled) => {
        if (!enabled) return;
        if (scanner) renderScanner();
        else if (isOverlayOpen()) openProfileSheet();
      });
      return;
    }
    if (action === "echo-archive") {
      openEchoArchive();
      return;
    }
  }

  const modeEl = event.target.closest("[data-mode]");
  if (modeEl) {
    state.identityMode = modeEl.dataset.mode;
    render();
    return;
  }

  const personaEl = event.target.closest("[data-persona]");
  if (personaEl) {
    state.celebId = personaEl.dataset.persona;
    render();
    haptic(6);
    return;
  }

  const colorEl = event.target.closest("[data-color]");
  if (colorEl) {
    state.selfColor = Number(colorEl.dataset.color);
    render();
    return;
  }

  const navEl = event.target.closest("[data-nav]");
  if (navEl) {
    const nav = navEl.dataset.nav;
    if (nav === "feed") {
      closeOverlay();
      if (state.screen !== "feed") {
        state.screen = "feed";
      }
      render();
    } else if (nav === "trends") openTrendsSheet();
    else if (nav === "scan") openScanner();
    else if (nav === "profile") openProfileSheet();
    return;
  }

  const likeEl = event.target.closest("[data-like]");
  if (likeEl) {
    likePost(likeEl.dataset.like, false);
    return;
  }

  const commentEl = event.target.closest("[data-comment]");
  if (commentEl) {
    openReplySheet(commentEl.dataset.comment);
    return;
  }

  const saveEl = event.target.closest("[data-save]");
  if (saveEl) {
    savePost(saveEl.dataset.save);
    return;
  }

  const mediaEl = event.target.closest("[data-media]");
  if (mediaEl) {
    likePost(mediaEl.dataset.media, true);
    return;
  }

  const repostEl = event.target.closest("[data-repost]");
  if (repostEl) {
    repostPost(repostEl.dataset.repost, repostEl);
    return;
  }

  const moreEl = event.target.closest("[data-more]");
  if (moreEl) {
    const post = state.run?.feed.find((item) => item.id === moreEl.dataset.more);
    if (post?.author === "you") toast("You are the only human here. Keep it that way.", "eye");
    else toast(pick([
      "This account is 100% synthetic.",
      "Reported to no one. The algorithm agrees with itself.",
      "This post has been fact-checked by a bot with a podcast.",
      "You cannot mute the feed. You can only scroll faster.",
    ]), "alert");
    return;
  }

  const ideaEl = event.target.closest("[data-idea]");
  if (ideaEl) {
    if (!state.compose) return;
    state.compose.selectedId = ideaEl.dataset.idea;
    const idea = state.compose.ideas.find((item) => item.id === ideaEl.dataset.idea);
    if (idea) state.compose.text = idea.text;
    refreshComposer();
    return;
  }

  const vibeEl = event.target.closest("[data-vibe]");
  if (vibeEl) {
    if (!state.compose) return;
    state.compose.vibeId = vibeEl.dataset.vibe;
    refreshComposer();
    return;
  }

  const replyEl = event.target.closest("[data-reply]");
  if (replyEl) {
    submitReply(replyEl.dataset.post, replyEl.dataset.reply);
    return;
  }

  const storyEl = event.target.closest("[data-story]");
  if (storyEl) {
    const author = storyEl.dataset.story;
    if (author === "you") {
      toast("Your story is empty. The bots are watching the silence.", "eye");
    } else {
      const bot = BOTS[author];
      toast(`LIVE · @${esc(bot?.handle || author)} ${pick(STORY_ACTIVITIES)}`, "flame");
    }
    return;
  }
});

function repostPost(postId, button) {
  const run = state.run;
  if (!run) return;
  const post = run.feed.find((item) => item.id === postId);
  if (!post) return;
  post.reposts = (post.reposts || 0) + 1;
  const count = button.querySelector(".count");
  if (count) count.textContent = formatNum(post.reposts);
  haptic(5);
  toast(pick([
    "Reposted. The signal spreads.",
    "Reposted to your followers. All one of them.",
    "Reposted. The algorithm felt that.",
  ]), "repost");
}

document.addEventListener("input", (event) => {
  if (event.target.id === "selfName") {
    state.selfName = event.target.value;
    const handle = $("#handlePreview");
    if (handle) handle.textContent = `@${slug(event.target.value)}`;
    const displayName = event.target.value.trim() || "You";
    $$(".avatar-choice").forEach((choice, index) => {
      const avatar = choice.querySelector(".avatar");
      if (avatar) avatar.innerHTML = avatarSVG(SELF_COLORS[index], shortName(displayName), 21 + index * 7);
    });
    return;
  }
  if (event.target.id === "captionInput" && state.compose) {
    state.compose.text = event.target.value;
    const count = $("#captionCount");
    if (count) count.textContent = `${event.target.value.length}/220`;
    updateComposerProjection();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isOverlayOpen()) {
    closeOverlay();
    updateHud();
  }
});

/* Expose a small hook for local QA and browser capture. */
window.PARASOCIAL = {
  state,
  render,
  startRun,
  openScanner,
  finishRun,
  enableTilt,
};

render();
