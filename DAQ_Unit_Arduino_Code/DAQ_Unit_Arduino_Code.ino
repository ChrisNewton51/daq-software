//Included Libraries
#include <SPI.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

//Voltage Declarations
int VoltageValue = 0; //variable used to read from the sensor
float VoltageReading; //variable used to send to the software
float R1 = 30000.0; //value of resistor 1
float R2 = 7500.0; //value of resistor 2

//Current Declarations
unsigned int x=0;
float AcsValue,Samples,AvgAcs,AcsValueF;

//Capacitance Declarations
int analogPin = 1;
int chargePin = 13; 
int dischargePin = 11;
int R3 = 10000;

unsigned long startTime; 
unsigned long elapsedTime;

float microFarads;                
float nanoFarads;

//Inductance Declarations
double pulse, frequency, capacitance, inductance, inductance_mH;

//Magnetic Field Declarations
int rawvalue;

//LCD Declarations
LiquidCrystal_I2C lcd(0x27,20,4); //LCD setup of 20 chars by 4 lines

//Button Declarations
const int buttonPin = 7;
int Button_State = 0;
int button_value = 1;

void setup() {
  //Setting up capacitance
  pinMode(chargePin, OUTPUT);     
  digitalWrite(chargePin, LOW); 
  //Setting up inductance
  pinMode(5, INPUT); //Input from the comparator output
  pinMode(6, OUTPUT);//output through a 150 ohm resistor to thr LC circuit
  //Button Setup
  pinMode(buttonPin,INPUT);
  //setting up the LCD screen
  Serial.begin(115000);
  lcd.init();
  lcd.backlight();

}

void loop() {
  Button_State = digitalRead(buttonPin); //read the value of the button
  
  if(Button_State == HIGH) //if the button is pushed
  {
    if(button_value == 5) //if the current value of the button is 5 then reset to 1
    {
      lcd.clear();
      button_value = 1; //reset the button value to 1
    }
    else //if the button value is 1-4
    {
      lcd.clear();
      button_value = button_value +1; //increment the value of the button by 1
    }
  }
  
  switch(button_value) //swicth determines which sensor is selected
  {
    case 1: //voltage case
        VoltageValue = analogRead(A0);
        VoltageReading = VoltageValue * (5.17/1024)*((R1 + R2)/R2);
        Serial.print("Volt "); //display the mode code to the software
        Serial.println(VoltageReading); //sending the value of the sensor reading
        //delay(500);
        
        //Display on the LCD
        lcd.setCursor(0,0); // set cursor to 1 symbol of 1 line
        lcd.print("Voltage Mode");
        lcd.setCursor(0,1); // set cursor to 1 symbol of 2 line
        //lcd.print("Voltage: ");
        lcd.print(VoltageReading); 
        
        break;
    case 2: //current case
        AcsValue=0.0,Samples=0.0,AvgAcs=0.0,AcsValueF=0.0; //reseting to 0.0
  
        for (int x = 0; x < 150; x++)
        { //Get 150 samples
        AcsValue = analogRead(A0);     //Read current sensor values   
        Samples = Samples + AcsValue;  //Add samples together
        //delay (3); // let ADC settle before next sample 3ms
        }
        
        AvgAcs=Samples/150.0;//Taking Average of Samples
        AcsValueF = (AvgAcs * (5.0 / 1024.0));
        Serial.print("Cur "); //display the mode code to the software
        Serial.println(AcsValueF);//Print the read current on Serial monitor
        //delay(50);

        //Display on the LCD
        lcd.setCursor(0,0); // set cursor to 1 symbol of 1 line
        lcd.print("Current Mode");
        lcd.setCursor(0,1); // set cursor to 1 symbol of 2 line
        //lcd.print("Current: ");
        lcd.print(AcsValueF); 

        break;
    case 3: //capacitance case
      digitalWrite(chargePin, HIGH); // Begins charging the capacitor
      startTime = millis(); // Begins the timer
      
      //while(analogRead(analogPin) < 648)
      //{       
        // Does nothing until capacitor reaches 63.2% of total voltage
      //}
    
      elapsedTime= millis() - startTime; // Determines how much time it took to charge capacitor
      microFarads = ((float)elapsedTime / R3) * 1000;
      //Serial.print(elapsedTime);       
      //Serial.print(" mS    ");
      lcd.setCursor(0,0); // set cursor to 1 symbol of 1 line
      lcd.print("Capacitance Mode"); 
     
      //lcd.print(elapsedTime);
      //lcd.print(" mS   "); 
             
    
      if (microFarads > 1) // Determines if units should be micro or nano and prints accordingly
      {
        Serial.print("Cap ");
        Serial.print((long)microFarads);       
        Serial.println(" mF"); 
        lcd.setCursor(0,1); // set cursor to 1 symbol of 2 line 
        lcd.print ((long)microFarads);
        lcd.print (" microFarads");       
      }
    
      else
      {
        Serial.print("Cap ");
        nanoFarads = microFarads * 1000.0;      
        Serial.print((long)nanoFarads);         
        Serial.println(" nF");
        lcd.setCursor(0,1); // set cursor to 1 symbol of 2 line 
        lcd.print ((long)nanoFarads);
        lcd.print (" nanoFarads");           
        //delay(500); 
      }
    
      digitalWrite(chargePin, LOW); // Stops charging capacitor
      pinMode(dischargePin, OUTPUT); 
      digitalWrite(dischargePin, LOW); // Allows capacitor to discharge  
        
      //while(analogRead(analogPin) > 0)
      //{
        // Do nothing until capacitor is discharged      
      //}
    
      pinMode(dischargePin, INPUT); // Prevents capacitor from discharging 

      break;
    case 4: //inductance case
      lcd.setCursor(0, 0);
      lcd.print("Inductance Mode");
      digitalWrite(6, HIGH);
      //delay(5);//give some time to charge inductor.
      digitalWrite(6, LOW);
      pulse = pulseIn(5, HIGH, 5000);//returns 0 if timeout
      
      if(pulse > 0.1)
      { //if a timeout did not occur and it took a reading:
        capacitance = 2.E-7; // <- insert value here
        frequency = 1.E6/(2*pulse);
        inductance = 1./(capacitance*frequency*frequency*4.*3.14159*3.14159);
        inductance *= 1E6; //note that this is the same as saying inductance = inductance*1E6
        //Serial print
        Serial.print("Ind ");
        Serial.println( inductance );
        //delay(10);
        //LCD print
        lcd.setCursor(0, 1);
        lcd.print(inductance);

        //delay(10);
      }

      break;
    case 5: //magnetic field case -------------------------------------------------------------- need work
      lcd.setCursor(0, 0);
      lcd.print("Magnetic Field Mode");
      rawvalue = analogRead(A0);
      //Serial.println(rawvalue);

      //need to do a conversion here
      
      //String ADCVALUE = String((analogRead(A0)-569)/0.376);
      //ADCVALUE.toCharArray(ADCSHOW,5);

      break;
    default: 
      break;
  }
  
}
