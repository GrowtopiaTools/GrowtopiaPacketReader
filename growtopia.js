var baseAddress = Module.findBaseAddress("Growtopia.exe");
var enetHostService = baseAddress.add(0x421960);
var enetPeerSend = baseAddress.add(0x421440);

var ENetEventType = {
	NONE: 0,
	CONNECT: 1, 
	DISCONNECT: 2,
	RECEIVE: 3
};

// Outgoing packets
Interceptor.attach(enetPeerSend, {
	onEnter: function(args) {

		var packet = ptr(args[2]);
		var data = getPacketData(packet);

		console.log("\x1b[1m\x1b[36m" + hexdump(data) + "\n\x1b[0m");
		
	}
});

// Incoming packets
var enetEvent = null;
Interceptor.attach(enetHostService, {
	onEnter: function(args) {
		enetEvent = args[1];
	},
	onLeave: function(ret) {
		if (ret > 0) {

			var event = ptr(enetEvent);
			var eventType = event.readU8();

			switch (eventType) {
				case ENetEventType.CONNECT:
					console.log("Connected to server\n")
					break;
				case ENetEventType.DISCONNECT:
					console.log("Disconnected from server\n");
					break;
				case ENetEventType.RECEIVE:

					var packet = event.add(0x18).readPointer();
					var data = getPacketData(packet);

					console.log("\x1b[1m\x1b[32m" + hexdump(data) + "\n\x1b[0m");
					
					break;
			}

		}
	}
});
 
function getPacketData(packet) {
	var dataLength = packet.add(0x18).readUInt();
	var data = packet.add(0x10).readPointer().readByteArray(dataLength);
	return data;
}