import { apiService } from "../services/api";

export function createFriendsSection(): HTMLElement {
  const container = document.createElement("div");
  container.className = "friends-section";

  // Title
  const title = document.createElement("h2");
  title.className = "friends-title";
  title.textContent = "FRIENDS LIST";
  container.appendChild(title);

  // Add/Search Friend UI
  const addFriendSection = document.createElement("div");
  addFriendSection.className = "add-friend-section";
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search users by username...";
  searchInput.className = "search-friend-input";
  const searchBtn = document.createElement("button");
  searchBtn.className = "primary-button";
  searchBtn.textContent = "Search";
  addFriendSection.appendChild(searchInput);
  addFriendSection.appendChild(searchBtn);
  container.appendChild(addFriendSection);

  // Search results
  const searchResults = document.createElement("div");
  searchResults.className = "search-results";
  container.appendChild(searchResults);

  searchBtn// @ts-ignore
          .onclick = () => {
    const query = searchInput.value.trim();
    if (!query) {
      searchResults.innerHTML = "<div class='search-empty'>Enter a username to search.</div>";
      return;
    }
    searchResults.innerHTML = "Searching...";
    apiService.users.searchForFriends().then((res) => {
      const users = res.data?.users || [];
      const filtered = users.filter((u: any) => u.username.toLowerCase().includes(query.toLowerCase()));
      if (filtered.length === 0) {
        searchResults.innerHTML = "<div class='search-empty'>No users found.</div>";
      } else {
        searchResults.innerHTML = "";
        filtered.forEach((user: any) => {
          const userCard = document.createElement("div");
          userCard.className = "search-user-card";
          userCard.innerHTML = `
            <span class='search-username'>${user.username}</span>
            <button class='primary-button'>Send Friend Request</button>
          `;
          userCard.querySelector(".primary-button")!// @ts-ignore
          .onclick = () => {
            apiService.users.addFriends(parseInt(user.id)).then((res) => {
              showMessage(res.data?.message || "Request sent!");
              loadPendingRequests();
            });
          };
          searchResults.appendChild(userCard);
        });
      }
    });
  };

  // Friends List
  const friendsList = document.createElement("div");
  friendsList.className = "friends-list";
  container.appendChild(friendsList);

  // Pending Requests
  const pendingSection = document.createElement("div");
  pendingSection.className = "pending-requests-section";
  const pendingTitle = document.createElement("h3");
  pendingTitle.textContent = "Friend Requests";
  pendingSection.appendChild(pendingTitle);
  const pendingList = document.createElement("div");
  pendingList.className = "pending-list";
  pendingSection.appendChild(pendingList);
  container.appendChild(pendingSection);

  // Search and load friends with real-time status
  function loadFriends() {
    console.log('[🔄 FRIENDS STATUS] Starting loadFriends()...');
    friendsList.innerHTML = "";
    
    apiService.users.getMyProfile().then(async (res) => {
      console.log('[📋 FRIENDS STATUS] getMyProfile response:', res);
      const friends = res.data?.user?.friends || [];
      console.log('[👥 FRIENDS STATUS] Raw friends data:', friends);
      console.log('[📊 FRIENDS STATUS] Number of friends found:', friends.length);
      
      if (friends.length === 0) {
        console.log('[❌ FRIENDS STATUS] No friends found, showing empty message');
        friendsList.innerHTML = `<div class='no-friends'>No friends yet. Start by adding some friends!</div>`;
      } else {
        // Get current user ID for status API call
        const currentUserId = res.data?.user?.id;
        console.log('[🆔 FRIENDS STATUS] Current user ID:', currentUserId);
        
        // Fetch real-time friend statuses
        let friendsWithStatus = friends;
        if (currentUserId) {
          console.log('[🌐 FRIENDS STATUS] Making API call to /friends-status/' + currentUserId);
          try {
            const statusRes = await (apiService.users as any).currentStatus(currentUserId);
            console.log('[✅ FRIENDS STATUS] API call successful! Response:', statusRes);
            const statusFriends = statusRes.data?.friends || [];
            console.log('[📡 FRIENDS STATUS] Status friends from backend:', statusFriends);
            console.log('[📊 FRIENDS STATUS] Number of status friends:', statusFriends.length);
            
            // Merge status data with friends data
            friendsWithStatus = friends.map((friend: any) => {
              const statusFriend = statusFriends.find((sf: any) => sf.id === friend.id);
              console.log(`[🔗 FRIENDS STATUS] Merging friend ${friend.username} (ID: ${friend.id}):`, {
                originalFriend: friend,
                statusFriend: statusFriend,
                finalStatus: statusFriend?.current_status || 'offline',
                lastSeen: statusFriend?.last_seen
              });
              return {
                ...friend,
                current_status: statusFriend?.current_status || 'offline',
                last_seen: statusFriend?.last_seen
              };
            });
            console.log('[🎯 FRIENDS STATUS] Final merged friends with status:', friendsWithStatus);
          } catch (error) {
            console.error('[❌ FRIENDS STATUS] Error fetching friend statuses:', error);
            console.error('[🔍 FRIENDS STATUS] Error details:', (error as any)?.message || error);
          }
        } else {
          console.log('[⚠️ FRIENDS STATUS] No current user ID, skipping status fetch');
        }
        
        console.log('[🎨 FRIENDS STATUS] Starting UI rendering for', friendsWithStatus.length, 'friends');
        friendsWithStatus.forEach((friend: any, index: number) => {
          console.log(`[🖼️ FRIENDS STATUS] Rendering friend ${index + 1}/${friendsWithStatus.length}:`, friend);
          
          const friendCard = document.createElement("div");
          friendCard.className = "friend-card";
          
          // Create status indicator with proper styling
          const statusClass = friend.current_status === 'online' ? 'status-online' : 'status-offline';
          const statusText = friend.current_status === 'online' ? 'Online' : 'Offline';
          console.log(`[🎯 FRIENDS STATUS] Friend ${friend.username} status: ${friend.current_status} -> ${statusText} (class: ${statusClass})`);
          
          // Format last seen time if offline
          let lastSeenText = '';
          if (friend.current_status === 'offline' && friend.last_seen) {
            console.log(`[⏰ FRIENDS STATUS] Processing last_seen for ${friend.username}:`, friend.last_seen);
            
            // Parse ISO timestamp from backend
            const lastSeen = new Date(friend.last_seen);
            
            const now = new Date();
            const diffMs = now.getTime() - lastSeen.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            console.log(`[📊 FRIENDS STATUS] Time calculations for ${friend.username}:`, {
              originalLastSeen: friend.last_seen,
              parsedLastSeen: lastSeen.toISOString(),
              now: now.toISOString(),
              diffMs,
              diffMins,
              diffHours,
              diffDays
            });
            
            if (diffMins < 1) {
              lastSeenText = 'Just now';
            } else if (diffMins < 60) {
              lastSeenText = `${diffMins}m ago`;
            } else if (diffHours < 24) {
              lastSeenText = `${diffHours}h ago`;
            } else {
              lastSeenText = `${diffDays}d ago`;
            }
            console.log(`[⏰ FRIENDS STATUS] Final lastSeenText for ${friend.username}:`, lastSeenText);
          } else {
            console.log(`[⏰ FRIENDS STATUS] No last_seen processing for ${friend.username} (status: ${friend.current_status}, last_seen: ${friend.last_seen})`);
          }
          
          const htmlContent = `
            <div class="friend-info">
              <div class="friend-avatar">
                <img src="/uploads/${friend.avatar || 'default.jpg'}" alt="${friend.username}" class="friend-avatar-img" />
                <div class="status-indicator ${statusClass}"></div>
              </div>
              <div class="friend-details">
                <span class="friend-username">${friend.username}</span>
                <div class="friend-status-container">
                  <span class="friend-status ${statusClass}">${statusText}</span>
                  ${lastSeenText ? `<span class="last-seen">${lastSeenText}</span>` : ''}
                </div>
              </div>
            </div>
            <button class="remove-friend-btn">Remove</button>
          `;
          
          console.log(`[🏗️ FRIENDS STATUS] Generated HTML for ${friend.username}:`, htmlContent);
          friendCard.innerHTML = htmlContent;
          
          console.log(`[🔗 FRIENDS STATUS] Adding event listener for remove button (friend ID: ${friend.id})`);
          friendCard.querySelector(".remove-friend-btn")!// @ts-ignore
          .onclick = () => removeFriend(friend.id);
          
          console.log(`[📋 FRIENDS STATUS] Appending friend card to friendsList`);
          friendsList.appendChild(friendCard);
          
          console.log(`[✅ FRIENDS STATUS] Successfully rendered friend: ${friend.username}`);
        });
        
        console.log('[🎉 FRIENDS STATUS] Completed rendering all friends!');
      }
    });
  }

  // Load pending requests
  // Create sent requests section once
  const sentSection = document.createElement("div");
  sentSection.className = "sent-requests-section";
  const sentTitle = document.createElement("h3");
  sentTitle.textContent = "Sent Friend Requests";
  sentSection.appendChild(sentTitle);
  const sentList = document.createElement("div");
  sentList.className = "sent-list";
  sentSection.appendChild(sentList);
  container.appendChild(sentSection);

  function loadPendingRequests() {
    pendingList.innerHTML = "";
    apiService.users.listRequests().then((res) => 
      {
      let pending = [];
      if (Array.isArray(res.data?.pendingRequests)) 
      {
        pending = res.data.pendingRequests;
      } else if (Array.isArray(res.data?.pendingRequests?.pendingRequests)) {
        pending = res.data.pendingRequests.pendingRequests;
      }
      if (pending.length > 0) {
        pending.forEach((req: any) => {
          const reqCard = document.createElement("div");
          reqCard.className = "pending-card";
          reqCard.innerHTML = `
            <span>From: ${req.sender_username} </span>
            <button class="accept-btn">Accept</button>
            <button class="reject-btn">Reject</button>
          `;
          reqCard.querySelector(".accept-btn")!// @ts-ignore
          .onclick = () => respondToRequest(req.id, "accepted");
          reqCard.querySelector(".reject-btn")!// @ts-ignore
          .onclick = () => respondToRequest(req.id, "rejected");
          pendingList.appendChild(reqCard);
        });
      } else {
        pendingList.innerHTML = "<div class='no-pending'>No friend requests.</div>";
      }
    });
    // Update sent requests section only (do not create again)
    sentList.innerHTML = "";
    apiService.users.listSentRequests().then((res) => {
      const sent = res.data?.sentRequests || [];
      if (sent.length > 0) {
        sent.forEach((req: any) => {
          const sentCard = document.createElement("div");
          sentCard.className = "sent-card";
          sentCard.innerHTML = `<span>To: ${req.receiver_username} </span> <span class='sent-status'>Pending</span>`;
          sentList.appendChild(sentCard);
        });
      } else {
        sentList.innerHTML = "<div class='no-sent'>No sent requests.</div>";
      }
    });
  }

  // Remove friend
  // function removeFriend(_friendId: number) {
  //   // TODO: Implement backend remove friend endpoint
  //   showMessage("Friend removed successfully.");
  //   loadFriends();
  // }

    // Remove friend
  function removeFriend(_friendId: number) {
    // call backend API
      apiService.users.removeFriend(_friendId).then((res) => {
        showMessage(res.data?.message || "Response sent!");
        showMessage("Friend removed successfully.");
        loadFriends();
    });
  }

  // Respond to request
  function respondToRequest(requestId: number, action: string) {
    apiService.users.sendRequestResponse(requestId, action).then((res) => {
      showMessage(res.data?.message || "Response sent!");
      loadPendingRequests();
      loadFriends();
    });
  }

  // Helper: show message
  function showMessage(msg: string) {
    let msgBar = document.querySelector('.custom-message-bar') as HTMLElement;
    if (!msgBar) {
      msgBar = document.createElement('div');
      msgBar.className = 'custom-message-bar';
      document.body.appendChild(msgBar);
    }
    msgBar.textContent = msg;
    msgBar.style.display = 'block';
    setTimeout(() => {
      msgBar.style.display = 'none';
    }, 2500);
  }

  // Auto-refresh friends status every 30 seconds
  let statusRefreshInterval: number;
  
  function startStatusRefresh() {
    // Clear any existing interval
    if (statusRefreshInterval) {
      clearInterval(statusRefreshInterval);
    }
    
    // Refresh every 30 seconds
    statusRefreshInterval = setInterval(() => {
      console.log('[hanieh debug] Auto-refreshing friend statuses...');
      loadFriends();
    }, 30000);
  }
  
  // Stop refresh when component is removed
  function stopStatusRefresh() {
    if (statusRefreshInterval) {
      clearInterval(statusRefreshInterval);
    }
  }
  
  // Add cleanup when container is removed from DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === container) {
          console.log('[hanieh debug] Friends section removed, stopping status refresh');
          stopStatusRefresh();
        }
      });
    });
  });
  
  // Observe the parent for removal
  if (container.parentNode) {
    observer.observe(container.parentNode, { childList: true });
  }

  // Initial load
  loadFriends();
  loadPendingRequests();
  
  // Start auto-refresh
  startStatusRefresh();

  return container;
}
