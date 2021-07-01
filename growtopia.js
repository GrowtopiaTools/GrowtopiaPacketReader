var growtopia = Module.load("Growtopia.exe");

var enetHostService = ptr(Memory.scanSync(growtopia.base, growtopia.size, "48 89 5c 24 08 48 89 74 24 18 57 48 83 ec 20 41 8b f0 48 8b fa 48 8b d9 48 85 d2 74 23 33 c0 89 02 48 89 42 08 48 89 42 18")[0].address);
var enetPeerSend = ptr(Memory.scanSync(growtopia.base, growtopia.size, "40 55 57 41 54 48 81 ec 90 00 00 00 48 8b e9 44 0f b6 e2 49 8b f8 41 8b c4 4b 8d 0c a4 48 c1 e1 04 48 03 4d 50 83 7d 48 05")[0].address);

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

console.log("Ready");
