package com.sohan.TaskManager.Repo;

import com.sohan.TaskManager.Model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepo extends JpaRepository<Task,Long> {


    Iterable<? extends Task> findByUsername(String username);
}
