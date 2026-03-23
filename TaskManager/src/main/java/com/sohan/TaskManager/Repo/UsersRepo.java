package com.sohan.TaskManager.Repo;

import com.sohan.TaskManager.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepo extends JpaRepository<Users,Long> {
     Users findByUsername(String username) ;
}
