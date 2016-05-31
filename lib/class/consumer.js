'use strict'

const AMQP = require('amqplib');
const EventEmitter = require('events');

class Consumer extends EventEmitter {

	constructor(channel, queue) {
		this.queue = queue;
		this.channel = channel;
		this.channel.consume(this.queue, msg => {
			if (msg !== null) this.emit('message', msg, msg.content.toString());
		});
	}
}

module.exports = Consumer;
