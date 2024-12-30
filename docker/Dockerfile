FROM eclipse-mosquitto

COPY mosquitto.conf /mosquitto/mosquitto.conf

COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD /run.sh
