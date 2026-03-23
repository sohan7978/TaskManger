package com.sohan.TaskManager.Controller;

import com.sohan.TaskManager.Model.Task;
import com.sohan.TaskManager.Repo.TaskRepo;
import com.sohan.TaskManager.TokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/task")
public class TaskController {

    @Autowired
    private TaskRepo taskRepo;

    @Autowired
    private TokenUtil tokenUtil;

    @PostMapping
    public Object createNote(@RequestBody Task note,
                             @RequestHeader("Authorization")String token){
        String username = tokenUtil.validateToken(token);

        if(username == null){
            return "Unauthorized";
        }
        note.setUsername(token);

        return taskRepo.save(note);

    }

    @GetMapping
    public Object getNotes(@RequestHeader("Authorization")String token){
        String username = tokenUtil.validateToken(token);
        if(username == null){
            return "Unauthorized";
        }
        return taskRepo.findByUsername(username);
    }

    @PutMapping("/{id}")
    public Object updateTask(
            @PathVariable Long id,
            @RequestBody Task updateTask,
            @RequestHeader("Authorization") String token){
        String username = tokenUtil.validateToken(token);
        if(username == null ){
            return "unauthorized";
        }
        Optional<Task> optionalTask = taskRepo.findById(id);
        if(optionalTask.isEmpty()){
            return "Task not found";
        }
        Task existingTask = optionalTask.get();
        //check ownership
        if(!existingTask.getUsername().equals(username)){
            return "you cannot update this note";
        }
        //Update fields
        existingTask.setTitle(updateTask.getTitle());
        existingTask.setTitle(updateTask.getDescription());
        return taskRepo.save(existingTask);

    }

}
