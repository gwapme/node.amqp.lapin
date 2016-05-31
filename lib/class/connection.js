'use strict'

const AMQP = require('amqplib');
const EventEmitter = require('events');
const Consumer = require('./consumer.js');

class Connection extends EventEmitter {

	constructor(host, options) {
		this.host = host;
		this.maxRetries = options.maxRetries || 5;
		this.retryDelay = options.retryDelay || 5000;
		this.connect(this.maxRetries);
	}

	connect(tries) {
		if (tries <= 0) throw new Error(`Couldn't connect to AMQP on host ${this.host}`);
		connectTry()
			.then(con => {
				this.connection = con;
				this.emit('ready', con);
			})
			.catch(() => setTimeout(() => this.connect(tries - 1), this.retryDelay));
	}

	connectTry() {
		return new Promise((resolve, reject) => {
			AMQP.connect(`amqp://${this.host}`)
				.then(resolve)
				.catch(reject);
		});
	}

	createConsumer(queue) {
		return new Promise((resolve, reject) => {
			this.connection.createChannel()
				.then(ch => resolve(new Consumer(ch, queue)))
				.catch(reject);
		});		
	}

	createProducer(queue) {
		return new Promise((resolve, reject) => {
			this.connection.createChannel()
				.then(ch => resolve(new Producer(ch, queue)))
				.catch(reject);
		});
	}
}

module.exports = Connection;
