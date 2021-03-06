from twilio.rest import Client
import boto3
import base64
from urllib import parse
import os

class Messager:

    twilio_numbers = {
        "dev": "+15124899353",
        "staging": "+15124886383",
        "prod": "+15124099745"
    }

    def __init__(self):
        self.twilio_client = self._load_twilio_client()
        self.env = os.environ.get('DEPLOY_STAGE')
        self.from_ = self.twilio_numbers[self.env]
    
    # def get_env(self, twilio_number):
    #     for env, number in self.twilio_numbers.items():
    #         if twilio_number == number:
    #             return env

    @staticmethod
    def parse_inbound_msg(event):
        if event['isBase64Encoded']:
            base64_message = event['body']
            base64_bytes = base64_message.encode('ascii')
            message_bytes = base64.b64decode(base64_bytes)
            message = message_bytes.decode('ascii')
            return parse.parse_qs(message)
        else:
            return parse.parse_qs(event['body'])

    
    @staticmethod
    def _load_twilio_client():
        secrets_client = boto3.session.Session().client(service_name='secretsmanager', region_name="us-east-1")
        get_secret_value_response = secrets_client.get_secret_value(SecretId='ggi-twilio')
        secret = eval(get_secret_value_response['SecretString'])
        client = Client(secret['TWILIO_SID'], secret['TWILIO_SECRET'])
        return client

    def send_sms(self, to_, body):
        if self.env == 'local':
            print(f"Message sent {self.from_} to {to_} -- ENV=DEV:\n", body)
            return 
        elif self.env in ['dev','staging']:
            body = f"[{self.env}] {body}"
        msg = self.twilio_client.messages.create(body=body,from_=self.from_,to=to_)
        resp = f"Message sent {self.from_} to {to_} with {body} -- {msg.sid}"
        print(resp)