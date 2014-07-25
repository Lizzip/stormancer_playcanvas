var updateIntervals = 200;

pc.script.create('stormancerscene', function (context) {
    var accountid = "ae3a5ae8-4e32-467c-a714-f9db5071aa6c";
    var appname = "playcanvas";
    var scenename = "test_scene";
    
    
    // Creates a new Stormancerscene instance
    var Stormancerscene = function (entity) {
        this.entity = entity;
        this.id = null;
        this.scene=null;
        this.otherPlayers = {};
        this.player = null;
        this.camera = null;
        this.enemyModel = null;
    };

    Stormancerscene.prototype = {
        initScene: function(scene){
            // capture the value of this to use in the continuations
            var that=this;
            
            //capture the game entities we will need
            this.player = this.entity.findByName('Player');
            this.camera = this.entity.findByName('Camera');
            this.enemyModel = this.entity.findByName('OtherPlayer');
            
            scene.onMessage("game.position", function(posUpdate){
                // check that we have an id and that this update is not us
                if(that.id && posUpdate.Id!= that.id){
                    // check if we already know this player
                    if(!(posUpdate.Id in that.otherPlayers)){
                        // clone the enemy model 
                        var newEnemy = that.enemyModel.clone();
                        that.otherPlayers[posUpdate.Id] = newEnemy;
                        that.entity.addChild(newEnemy);                       
                    }
                    // we send its new positin to the entity's script so that it performs interpolation
                    that.otherPlayers[posUpdate.Id].script.send('otherplayer', 'setposition', posUpdate);
                }
            });
            
            scene.onMessage("game.disconnected", function(id){
                if(id in that.otherPlayers){
                    // remove the other player from the game
                    that.otherPlayers[id].destroy();
                    delete that.otherPlayers[id];
                }                
            });
            
            scene.onMessage("game.space", function(){
               console.log("Space message returned"); 
            });
        },
        
        sendUpdates: function(){
            var that = this;
            // request an id to Stormancer
            this.scene.sendRequest("game.getId", "", function(id){
                that.id = id;
            }, function() {});
                
            // set a timer to send the player's position regularly
            setInterval(function () {
                var position = that.player.getPosition();
                that.scene.send("game.position", { X:position.x, Y:position.y, Z:position.z , Rotation: that.camera.getEulerAngles().y});
            }, updateIntervals);
        },
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            //create the Stormancer configuration to connect to the right application 
            var config = Stormancer.Configuration.forAccount(accountid, appname);
            
            //create the Stormncer client
            var client = $.stormancer(config);
            
            // capture the value of this to use in the continuations
            var that=this;
            // getting the scene from Stormancer
            client.getPublicScene(scenename, "").then(function(scene){
                that.scene=scene;
                // Initializing the scene
                that.initScene(scene); 
                // Connect to the scene
                scene.connect().then(function() {
                    that.sendUpdates();
                });
            });
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },
        
        sendSpaceMessage: function(){
            this.scene.send("game.space", "");
            console.log("message sent");
        }
    };

    return Stormancerscene;
});
