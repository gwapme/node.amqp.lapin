'use strict'

const EventEmitter = require('events');

class Producer extends EventEmitter {
	
	constructor(channel, queue) {
		this.queue = queue;
		this.channel = channel;
	}

	publish(msg) {
		this.channel.sendToQueue(this.queue, Buffer.from(msg));
	}
}

module.exports = Producer;
