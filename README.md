# attach-acm-to-nlb

- cdk deploy

```
% cd cdk
% npm i
% cdk diff attach-acm-to-nlb-stack -c stageName=dev -c tag=latest
```

- docker deploy

```
% node deploy.js dev latest
```

- local debug

```
% docker build --platform linux/amd64 -t debug_image:latest docker
% docker run -p 8883:8883 --rm -it debug_image:latest sh
# /run.sh
```

/private/etc/hosts

```
127.0.0.1   mqtt.alexa-dev.tokyo
```

```
% cd docker/certs
% host=mqtt.alexa-dev.tokyo
% mosquitto_sub  --cert client.crt --key client.key --cafile ca.crt -h $host -t /test -v
% mosquitto_pub --cert client.crt --key client.key --cafile ca.crt -h $host -m HELLO -t /test --tls-version tlsv1.2
```

## mosquitto設定

| 設定値              | MQTT | MQTTS | MQTTS相互認証 | 備考                                  |
| :------------------ | :--- | :---- | :------------ | :------------------------------------ |
| listener            | 1883 | 8883  | 8883          | 設定がない場合localhostのみ受け付ける |
| keyfile             | 　   | ◯     | ◯             | 　                                    |
| certfile            | 　   | ◯     | ◯             | 　                                    |
| cafile              | 　   |       | ◯             | クライアントの証明書検証用            |
| require_certificate | 　   |       | ◯             |                                       |

※ allow_anonymous true (パスワード認証)

```
% mosquitto_pub -p 8883 --cert client.crt --key client.key --cafile ca.crt -h $host -m HELLO -t /test --tls-version tlsv1.2
% mosquitto_sub -p 8883 --cert client.crt --key client.key --cafile ca.crt -h $host -t /test
```

## Log

### 8883 + 相互認証

```
1735531743: mosquitto version 2.0.20 starting
1735531743: Config loaded from /mosquitto/mosquitto.conf.
1735531743: Opening ipv4 listen socket on port 8883.
1735531743: Opening ipv6 listen socket on port 8883.
1735531743: mosquitto version 2.0.20 running
```

subscribe

```
1735531560: New connection from 172.17.0.1:35108 on port 8883.
1735531560: New client connected from 172.17.0.1:35108 as auto-4F6D3C9D-47B2-F8EF-9F67-EED07C676F54 (p2, c1, k60).
1735531560: No will message specified.
1735531560: Sending CONNACK to auto-4F6D3C9D-47B2-F8EF-9F67-EED07C676F54 (0, 0)
1735531560: Received SUBSCRIBE from auto-4F6D3C9D-47B2-F8EF-9F67-EED07C676F54
1735531560: 	/test (QoS 0)
1735531560: auto-4F6D3C9D-47B2-F8EF-9F67-EED07C676F54 0 /test
1735531560: Sending SUBACK to auto-4F6D3C9D-47B2-F8EF-9F67-EED07C676F54
```

publish

```
1735531609: New connection from 172.17.0.1:60002 on port 8883.
1735531609: New client connected from 172.17.0.1:60002 as auto-72D71FEA-AD22-B81C-E39F-3FAF21A9407D (p2, c1, k60).
1735531609: No will message specified.
1735531609: Sending CONNACK to auto-72D71FEA-AD22-B81C-E39F-3FAF21A9407D (0, 0)
1735531609: Received PUBLISH from auto-72D71FEA-AD22-B81C-E39F-3FAF21A9407D (d0, q0, r0, m0, '/test', ... (5 bytes))
1735531609: Sending PUBLISH to auto-4F6D3C9D-47B2-F8EF-9F67-EED07C676F54 (d0, q0, r0, m0, '/test', ... (5 bytes))
1735531609: Received DISCONNECT from auto-72D71FEA-AD22-B81C-E39F-3FAF21A9407D
1735531609: Client auto-72D71FEA-AD22-B81C-E39F-3FAF21A9407D disconnected.
```

### 8883

```
1735531743: mosquitto version 2.0.20 starting
1735531743: Config loaded from /mosquitto/mosquitto.conf.
1735531743: Opening ipv4 listen socket on port 8883.
1735531743: Opening ipv6 listen socket on port 8883.
1735531743: mosquitto version 2.0.20 running
```

subscribe

```
1735531793: New connection from 172.17.0.1:50738 on port 8883.
1735531793: New client connected from 172.17.0.1:50738 as auto-491885C9-7C84-8A62-AB9A-6DE4F705186A (p2, c1, k60).
1735531793: No will message specified.
1735531793: Sending CONNACK to auto-491885C9-7C84-8A62-AB9A-6DE4F705186A (0, 0)
1735531793: Received SUBSCRIBE from auto-491885C9-7C84-8A62-AB9A-6DE4F705186A
1735531793: 	/test (QoS 0)
1735531793: auto-491885C9-7C84-8A62-AB9A-6DE4F705186A 0 /test
1735531793: Sending SUBACK to auto-491885C9-7C84-8A62-AB9A-6DE4F705186A
```

publish

```
1735531878: New connection from 172.17.0.1:54596 on port 8883.
1735531878: New client connected from 172.17.0.1:54596 as auto-96798BA1-2B4B-0874-D059-8EFD2EEA3A2B (p2, c1, k60).
1735531878: No will message specified.
1735531878: Sending CONNACK to auto-96798BA1-2B4B-0874-D059-8EFD2EEA3A2B (0, 0)
1735531878: Received PUBLISH from auto-96798BA1-2B4B-0874-D059-8EFD2EEA3A2B (d0, q0, r0, m0, '/test', ... (5 bytes))
1735531878: Sending PUBLISH to auto-491885C9-7C84-8A62-AB9A-6DE4F705186A (d0, q0, r0, m0, '/test', ... (5 bytes))
1735531878: Received DISCONNECT from auto-96798BA1-2B4B-0874-D059-8EFD2EEA3A2B
1735531878: Client auto-96798BA1-2B4B-0874-D059-8EFD2EEA3A2B disconnected.
```

### 1883

```
1735531925: mosquitto version 2.0.20 starting
1735531925: Config loaded from /mosquitto/mosquitto.conf.
1735531925: Opening ipv4 listen socket on port 1883.
1735531925: Opening ipv6 listen socket on port 1883.
1735531925: mosquitto version 2.0.20 running

```

subscribe

```
1735531992: New connection from 172.17.0.1:52834 on port 1883.
1735531992: New client connected from 172.17.0.1:52834 as auto-8E74617C-C491-68F2-E9AD-018672286865 (p2, c1, k60).
1735531992: No will message specified.
1735531992: Sending CONNACK to auto-8E74617C-C491-68F2-E9AD-018672286865 (0, 0)
1735531992: Received SUBSCRIBE from auto-8E74617C-C491-68F2-E9AD-018672286865
1735531992: 	/test (QoS 0)
1735531992: auto-8E74617C-C491-68F2-E9AD-018672286865 0 /test
1735531992: Sending SUBACK to auto-8E74617C-C491-68F2-E9AD-018672286865
```

publish

```
1735532018: New connection from 172.17.0.1:44778 on port 1883.
1735532018: New client connected from 172.17.0.1:44778 as auto-4B491D67-EEAE-6D37-EA4A-BBEADB493D25 (p2, c1, k60).
1735532018: No will message specified.
1735532018: Sending CONNACK to auto-4B491D67-EEAE-6D37-EA4A-BBEADB493D25 (0, 0)
1735532018: Received PUBLISH from auto-4B491D67-EEAE-6D37-EA4A-BBEADB493D25 (d0, q0, r0, m0, '/test', ... (5 bytes))
1735532018: Sending PUBLISH to auto-8E74617C-C491-68F2-E9AD-018672286865 (d0, q0, r0, m0, '/test', ... (5 bytes))
1735532018: Received DISCONNECT from auto-4B491D67-EEAE-6D37-EA4A-BBEADB493D25
1735532018: Client auto-4B491D67-EEAE-6D37-EA4A-BBEADB493D25 disconnected.
```

###

ACM作成

% git clone
% cd mqtt-attach-acm-to-nlb
% cd cdk
% cdk/cdk.jsonで、deployするアカウント（accountId）及び、ACMのarn(certificateArn)を設定する

```
{
  "context": {
    "projectName": "mqtt-attach-acm-to-nlb",
    "accountId": "xxxxxxxxxxxx",
    "vpcCidr": "10.0.0.0/16",
    "taskCpu": 256,
    "taskMemory": 512,
    "desiredCount": 0,
    "natGateways": 0,
    "certificateArn": "arn:aws:acm:ap-northeast-1:xxxxxxxxxxxx:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",

```

- deploy
  % cdk diff mqtt-attach-acm-to-nlb-stack -c tag=latest
  % cdk deploy mqtt-attach-acm-to-nlb-stack -c tag=latest

- docker deploy

% node deploy.js latest

- "desiredCount": 2,にしてから再度cdk deploy

- deployされたNLBのDNS名を設定
  Rote53でAレコード（Alias）

動作確認（caの設定は必要ない）

```
% mosquitto_sub -p 8883 -h $host -t /test --tls-version tlsv1.2
% mosquitto_pub -p 8883 -h $host -m HELLO -t /test --tls-version tlsv1.2
```

コードは、タスク数0になっているので、この状態で、１回deployします

```
const desiredCount = 0;
```

コードは、タスク数を1に変更して再度deployします

ECS Esecで接続すれば、ログを確認できます

```
# tail -f /mosquitto/log/mosquitto.log


1735537576: mosquitto version 2.0.20 starting
1735537576: Config loaded from /mosquitto/mosquitto.conf.
1735537576: Opening ipv4 listen socket on port 1883.
1735537576: Opening ipv6 listen socket on port 1883.
1735537576: mosquitto version 2.0.20 running

1735537979: New connection from 10.0.0.234:27735 on port 1883.
1735537979: Client <unknown> closed its connection.
1735537979: New connection from 10.0.0.234:9385 on port 1883.
1735537980: New client connected from 10.0.0.234:9385 as auto-52EA306E-4A73-B6B3-3684-21EAE1BF5E4E (p2, c1, k60).
1735537980: No will message specified.
1735537980: Sending CONNACK to auto-52EA306E-4A73-B6B3-3684-21EAE1BF5E4E (0, 0)
1735537980: Received SUBSCRIBE from auto-52EA306E-4A73-B6B3-3684-21EAE1BF5E4E
1735537980: 	/test (QoS 0)
1735537980: auto-52EA306E-4A73-B6B3-3684-21EAE1BF5E4E 0 /test
1735537980: Sending SUBACK to auto-52EA306E-4A73-B6B3-3684-21EAE1BF5E4E


1735537987: New connection from 10.0.0.234:49501 on port 1883.
1735537987: New client connected from 10.0.0.234:49501 as auto-3A12ABED-0F80-90CF-DEEB-2E5D87126520 (p2, c1, k60).
1735537987: No will message specified.
1735537987: Sending CONNACK to auto-3A12ABED-0F80-90CF-DEEB-2E5D87126520 (0, 0)
1735537987: Received PUBLISH from auto-3A12ABED-0F80-90CF-DEEB-2E5D87126520 (d0, q0, r0, m0, '/test', ... (8 bytes))
1735537987: Sending PUBLISH to auto-52EA306E-4A73-B6B3-3684-21EAE1BF5E4E (d0, q0, r0, m0, '/test', ... (8 bytes))
1735537987: Received DISCONNECT from auto-3A12ABED-0F80-90CF-DEEB-2E5D87126520
1735537987: Client auto-3A12ABED-0F80-90CF-DEEB-2E5D87126520 disconnected.
```

- sslscanによる確認

```
% ./sslscan mqtt.alexa-dev.tokyo:8883
Version: 2.1.6-static
OpenSSL 3.0.15 3 Sep 2024

Connected to 54.168.131.237

Testing SSL server mqtt.alexa-dev.tokyo on port 8883 using SNI name mqtt.alexa-dev.tokyo

  SSL/TLS Protocols:
SSLv2     disabled
SSLv3     disabled
TLSv1.0   enabled
TLSv1.1   enabled
TLSv1.2   enabled
TLSv1.3   disabled

  TLS Fallback SCSV:
Server supports TLS Fallback SCSV

  TLS renegotiation:
Secure session renegotiation supported

  TLS Compression:
Compression disabled

  Heartbleed:
TLSv1.2 not vulnerable to heartbleed
TLSv1.1 not vulnerable to heartbleed
TLSv1.0 not vulnerable to heartbleed

  Supported Server Cipher(s):
Preferred TLSv1.2  128 bits  ECDHE-RSA-AES128-GCM-SHA256   Curve P-256 DHE 256
Accepted  TLSv1.2  128 bits  ECDHE-RSA-AES128-SHA256       Curve P-256 DHE 256
Accepted  TLSv1.2  128 bits  ECDHE-RSA-AES128-SHA          Curve P-256 DHE 256
Accepted  TLSv1.2  256 bits  ECDHE-RSA-AES256-GCM-SHA384   Curve P-256 DHE 256
Accepted  TLSv1.2  256 bits  ECDHE-RSA-AES256-SHA384       Curve P-256 DHE 256
Accepted  TLSv1.2  256 bits  ECDHE-RSA-AES256-SHA          Curve P-256 DHE 256
Accepted  TLSv1.2  128 bits  AES128-GCM-SHA256
Accepted  TLSv1.2  128 bits  AES128-SHA256
Accepted  TLSv1.2  128 bits  AES128-SHA
Accepted  TLSv1.2  256 bits  AES256-GCM-SHA384
Accepted  TLSv1.2  256 bits  AES256-SHA256
Accepted  TLSv1.2  256 bits  AES256-SHA
Preferred TLSv1.1  128 bits  ECDHE-RSA-AES128-SHA          Curve P-256 DHE 256
Accepted  TLSv1.1  256 bits  ECDHE-RSA-AES256-SHA          Curve P-256 DHE 256
Accepted  TLSv1.1  128 bits  AES128-SHA
Accepted  TLSv1.1  256 bits  AES256-SHA
Preferred TLSv1.0  128 bits  ECDHE-RSA-AES128-SHA          Curve P-256 DHE 256
Accepted  TLSv1.0  256 bits  ECDHE-RSA-AES256-SHA          Curve P-256 DHE 256
Accepted  TLSv1.0  128 bits  AES128-SHA
Accepted  TLSv1.0  256 bits  AES256-SHA

  Server Key Exchange Group(s):
TLSv1.2  128 bits  secp256r1 (NIST P-256)
TLSv1.2  192 bits  secp384r1 (NIST P-384)
TLSv1.2  260 bits  secp521r1 (NIST P-521)

  SSL Certificate:
Signature Algorithm: sha256WithRSAEncryption
RSA Key Strength:    2048

Subject:  mqtt.alexa-dev.tokyo
Altnames: DNS:mqtt.alexa-dev.tokyo
Issuer:   Amazon RSA 2048 M03

Not valid before: Dec 29 00:00:00 2024 GMT
Not valid after:  Jan 28 23:59:59 2026 GMT
```
