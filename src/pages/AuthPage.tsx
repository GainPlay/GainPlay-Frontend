import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../components/ui/tabs";

export default function AuthPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GainPlay%20(1)-yTMtfbwYJZTFXppHMRfXy6DGhEyzCj.png"
        alt="GainPlay Logo"
        width={200}
        height={200}
        className="mb-8"
      />
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form className="space-y-4">
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full">
              Sign in with Google
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="signup">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/onboarding");
            }}
          >
            <Input type="text" placeholder="Username" />
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Sign Up
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
