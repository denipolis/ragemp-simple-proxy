import UdpProxy from 'udp-proxy'
import TcpProxy from 'node-tcp-proxy'
import config from './config.js'

TcpProxy.createProxy(config.TcpPort, config.GameIP, config.TcpPort, {
  hostname: config.LocalIP
})

console.log(
  `[TCP] Start on ${config.LocalIP}:${config.TcpPort} -> ${config.GameIP}:${config.TcpPort}`
)

const udpServer = UdpProxy.createServer({
  address: config.GameIP,
  port: config.UdpPort,
  ipv6: false,
  localaddress: config.LocalIP,
  localport: config.UdpPort,
  localipv6: false,
  proxyaddress: '',
  timeOutTime: 10000
})

console.log(
  `[UDP] Started on ${config.LocalIP}:${config.UdpPort} -> ${config.GameIP}:${config.UdpPort}`
)

udpServer.on('bound', details => {
  console.log(
    `[UDP] Connect ${details.peer.address}:${details.peer.port} (${details.peer.size}b) -> PROXY -> ${details.target.address}:${details.target.port}`
  )
})

udpServer.on('[UDP] Error', error => console.log(error))

udpServer.on('message', (message, sender) => {
  console.log(
    `[UDP] Meesage FROM ${sender.address}:${sender.port} (${Buffer.byteLength(message)}b)`
  )

  if (config.ShowMessageContent)
    console.log(
      `HEX:    ${message
        .toString('hex')
        .match(/.{1,2}/g)
        .join(' ')
        .match(/.{1,32}/g)
        .join('\n\t')}`
    )
})

udpServer.on('proxyMsg', (message, sender, peer) => {
  console.log(
    `[UDP] Answer TO ${peer.address}:${peer.port} (${Buffer.byteLength(message)}b)`
  )

  if (config.ShowMessageContent)
    console.log(
      `HEX:    ${message
        .toString('hex')
        .match(/.{1,2}/g)
        .join(' ')
        .match(/.{1,32}/g)
        .join('\n\t')}`
    )
})

// 'proxyClose' is emitted when the socket closes (from a timeout) without new messages
udpServer.on('proxyClose', peer => {
  console.log(`[UDP] Disconnect ${peer.address}:${peer.port}`)
})

udpServer.on('proxyError', err => {
  console.log('[UDP] ProxyError' + err)
})
