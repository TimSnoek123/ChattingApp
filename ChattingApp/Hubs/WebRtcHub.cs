using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChattingApp.Hubs
{
    public class WebRtcHub : Hub
    {
        public async Task OnNewUserAsync(string username)
        {
            await Clients.Others.SendAsync("OnNewUser", username, Context.ConnectionId);
        }

        public async Task OnOfferAsync(string id, string localDescription)
        {
            await Clients.Others.SendAsync("OnOffer", id, localDescription);
        }

        public async Task OnCandidateAsync(string id, string candidate)
        {
            await Clients.Others.SendAsync("OnCandidate", id, candidate);
        }

        public async Task OnAnswerAsync(string id, string localDescription)
        {
            await Clients.Others.SendAsync("OnAnswer", id, localDescription);
        }
    }
}
