using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChattingApp.Hubs
{
    public class WebRtcHub : Hub
    {
        private static readonly Dictionary<string, string> connectedClients = new Dictionary<string, string>();
        public static Dictionary<string, string> ConnectedClients = connectedClients;

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.Others.SendAsync("OnDisconnected");

            if (ConnectedClients.ContainsKey(Context.ConnectionId))
                ConnectedClients.Remove(Context.ConnectionId);

            await base.OnDisconnectedAsync(exception);
        }

        public async Task OnNewUserAsync(string username)
        {
            ConnectedClients.Add(Context.ConnectionId, username);
            await Clients.Others.SendAsync("OnNewUser");
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
