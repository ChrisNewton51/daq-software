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
int chargePin = 13; //changed this ------------------------------------------------------------- should be 12
int dischargePin = 11;
int R3 = 10000;

unsigned long startTime; 
unsigned long elapsedTime;

float microFarads;                
float nanoFarads;

//Inductance Declarations
double pulse, frequency, capacitance, inductance;

//Magnetic Field Declarations
int rawvalue;
float Gval;

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
  pinMode(11, INPUT);
  pinMode(13, OUTPUT);
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
      delay(150);
    }
    else //if the button value is 1-4
    {
      lcd.clear();
      button_value = button_value +1; //increment the value of the button by 1
      delay(150);
    }
  }
  
  switch(button_value) //swicth determines which sensor is selected
  {
    case 1: //voltage case
        VoltageValue = analogRead(A0);
        VoltageReading = VoltageValue * (4.69/1024)*((R1 + R2)/R2);
        Serial.print("Volt "); //display the mode code to the software
        Serial.println(VoltageReading); //sending the value of the sensor reading
        //delay(500);
        
        //Display on the LCD
        lcd.setCursor(0,0); // set cursor to 1 symbol of 1 line
        lcd.print("Voltage");
        lcd.setCursor(0,1); // set cursor to 1 symbol of 2 line
        //lcd.print("Voltage: ");
        lcd.print(VoltageReading); 
        lcd.print(" V");

        delay(50);
        break;
    case 2: //current case
        AcsValue=0.0,Samples=0.0,AvgAcs=0.0,AcsValueF=0.0; //reseting to 0.0
  
        for (int x = 0; x < 150; x++)
        { //Get 150 samples
        AcsValue = analogRead(A3);     //Read current sensor values   
        Samples = Samples + AcsValue;  //Add samples together
        //delay (3); // let ADC settle before next sample 3ms
        }
        
        AvgAcs=Samples/150.0;//Taking Average of Samples
        //AcsValueF = 512 - (AvgAcs*0.0265);
        AcsValueF = ((AvgAcs * (5.0 / 1024.0) - 2.5)*-5.5);
        Serial.print("Cur "); //display the mode code to the software
        Serial.println(AcsValueF);//Print the read current on Serial monitor
        //delay(50);

        //Display on the LCD
        lcd.setCursor(0,0); // set cursor to 1 symbol of 1 line
        lcd.print("Current");
        lcd.setCursor(1,1); // set cursor to 1 symbol of 2 line
        //lcd.print(AvgAcs); 
        lcd.print(AcsValueF); 
        lcd.print(" A");

        delay(50);
        break;
    case 3: //capacitance case
      digitalWrite(chargePin, HIGH); // Begins charging the capacitor
      startTime = millis(); // Begins the timer
      
      while(analogRead(analogPin) < 648)
      {       
        // Does nothing until capacitor reaches 63.2% of total voltage
      }
    
      elapsedTime= millis() - startTime; // Determines how much time it took to charge capacitor
      microFarads = ((float)elapsedTime / R3) * 1000;
      //Serial.print(elapsedTime);       
      //Serial.print(" mS    ");
      lcd.setCursor(0,0); // set cursor to 1 symbol of 1 line
      lcd.print("Capacitance"); 
     
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
        
      while(analogRead(analogPin) > 0)
      {
        // Do nothing until capacitor is discharged      
      }
    
      pinMode(dischargePin, INPUT); // Prevents capacitor from discharging 

      delay(50);
      break;
    case 4: //inductance case
      digitalWrite(13, HIGH);
      delay(5);//give some time to charge inductor.
      digitalWrite(13,LOW);
      delayMicroseconds(100); //make sure resination is measured
      pulse = pulseIn(11,HIGH,5000);//returns 0 if timeout
      if(pulse > 0.1){ //if a timeout did not occur and it took a reading:
        
        
    //  #error insert your used capacitance value here. Currently using 2uF. Delete this line after that
      capacitance = 2.08E-6; // - insert value here
      
      frequency = 1.E6/(2*pulse);
      inductance = 1./(capacitance*frequency*frequency*4.*3.14159*3.14159);//one of my profs told me just do squares like this
      inductance *= 1E6; //note that this is the same as saying inductance = inductance*1E6
    
      //Serial print
      Serial.print("\tinductance uH:");
      Serial.println( inductance );
      delay(10);
    
      //LCD print
      lcd.setCursor(0,0); 
      lcd.print("Inductance:");
      lcd.setCursor(0,1); 
      lcd.print(inductance);
      lcd.setCursor(14,1); 
      lcd.print("uH");          
      delay(10);
      }

      delay(50);
      break;
    case 5: //magnetic field case 
      lcd.setCursor(0, 0);
      lcd.print("Magnetic Field");
      rawvalue = analogRead(A2);

      Gval = 436.65 - (rawvalue*2.13);

      Serial.print("Mag Field ");
      Serial.println(Gval);
      lcd.setCursor(0,1);
      lcd.print(Gval);

      delay(50);
      break;
    default: 
      break;
  }
  
}