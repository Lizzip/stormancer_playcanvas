using Stormancer.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stormancer.Samples.PlayCanvasFps
{
    public class SyncPositionBehavior : Behavior<Scene>
    {
        protected override void OnAttached()
        {
            this.AssociatedObject.RegisterRoute<PositionUpdate>("game.position", request =>
            {
                var posUdate = request.Content;
                posUdate.Id = request.Connection.Id;
                return this.AssociatedObject.Broadcast("game.position", posUdate);
            });

            this.AssociatedObject.RegisterRoute<string>("game.getId", request =>
            {
                return request.SendResponse(request.Connection.Id);
            });
			
			this.AssociatedObject.RegisterRoute<string>("game.space", request =>
			{
				return this.AssociatedObject.Broadcast("game.space", "space!");
			});

            this.AssociatedObject.OnDisconnect.Add(OnDisconnect);
        }

        private async Task OnDisconnect(IConnection connection)
        {
            await this.AssociatedObject.Broadcast("game.disconnected", connection.Id);
        }
		
        protected override void OnDetached()
        {
        }

    }
}
