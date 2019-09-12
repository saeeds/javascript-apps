
(function(){
  
   var questions = [new Question('Is JavaScript the cloolest programing language in the world?',['Yes','No'], 0),
                   new Question('What is the name of this course\'s teacher?',['Johan', 'Micheal','Joans'],2),
                   new Question('What does best describe coding?',['Boring','Hard','Fun','Tedious'],2)];
    
   function Question(question, answers, correct){
     this.question = question;
     this.answers = answers;
     this.correct = correct;
   }

   Question.prototype.displayQuestion = function(){
       console.log(this.question);
       for(var i = 0; i < this.answers.length; i++){
          console.log(i + ': ' + this.answers[i]);
       }
   };

   Question.prototype.checkAnswer = function(ans,callback){
     var sc;
     if(ans === this.correct){
        console.log('Correct answer !');
        sc = callback(true);
     } else{
        console.log('Wrong answer, Try again !');
        sc =  callback(false);
     }
     
     this.displayScore(sc)
   }
   
   Question.prototype.displayScore = function(score){
       console.log('your current score is: ' + score);
       console.log('-------------------------------');
   }
   
   function scroe(){
       var sc = 0;
       return function(correct){
           if(correct){
               sc++;
           }
           return sc;
       }
   }
   
   var keepScore = scroe();
    
  function nextQuestion(){
      var n = Math.floor(Math.random() * questions.length);
      
      questions[n].displayQuestion();
      
      var answer = prompt('Please select the correct answer.');
      
     
      if(answer !== 'exit'){
          
          questions[n].checkAnswer(parseInt(answer),keepScore);
          
          nextQuestion();
      }
      
  };
  
  nextQuestion();
 
})();





