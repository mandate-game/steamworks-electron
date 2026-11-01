import * as steamworks from "@mandate-game/steamworks-electron";

export default function main() {
	const client = steamworks.init(480);
	console.log(client.localplayer.getName())
}
