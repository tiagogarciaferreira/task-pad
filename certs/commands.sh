
# Generate
openssl req -x509 -nodes -days 365 -newkey rsa:4096   -keyout key.pem   -out cert.pem   -config openssl.cnf
openssl x509 -in cert.pem -text -noout

# Encode base64
base64 -w 0 cert.pem
base64 -w 0 key.pem
